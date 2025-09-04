import { useState, useMemo } from "react";

export interface Column<T> {
  key: string;
  title: string;
  dataIndex: keyof T;
  sortable?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  selectable?: boolean;
  onRowSelect?: (selectedRows: T[]) => void;
}

function DataTable<T extends { [key: string]: any }>({
  data,
  columns,
  loading = false,
  selectable = false,
  onRowSelect,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedRows, setSelectedRows] = useState<T[]>([]);

  // Sorting logic
  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      if (a[sortKey] > b[sortKey]) return sortOrder === "asc" ? 1 : -1;
      if (a[sortKey] < b[sortKey]) return sortOrder === "asc" ? -1 : 1;
      return 0;
    });
  }, [data, sortKey, sortOrder]);

  const toggleSort = (key: keyof T) => {
    if (sortKey === key) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  // Row selection
  const handleRowSelect = (row: T) => {
    let newSelected: T[];
    if (selectedRows.includes(row)) {
      newSelected = selectedRows.filter((r) => r !== row);
    } else {
      newSelected = selectable ? [...selectedRows, row] : [row];
    }
    setSelectedRows(newSelected);
    onRowSelect?.(newSelected);
  };

  // Loading / Empty states
  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (data.length === 0)
    return <div className="p-4 text-center">No data available</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            {selectable && <th className="p-2"></th>}
            {columns.map((col) => (
              <th
                key={col.key}
                className="p-2 cursor-pointer select-none"
                onClick={() => col.sortable && toggleSort(col.dataIndex)}
                aria-sort={
                  sortKey === col.dataIndex
                    ? sortOrder === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                <div className="flex items-center gap-1">
                  {col.title}
                  {sortKey === col.dataIndex && (
                    <span>{sortOrder === "asc" ? "▲" : "▼"}</span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, idx) => (
            <tr
              key={idx}
              className={`hover:bg-gray-50 ${
                selectedRows.includes(row) ? "bg-blue-100" : ""
              }`}
              onClick={() => selectable && handleRowSelect(row)}
            >
              {selectable && (
                <td className="p-2 text-center">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(row)}
                    readOnly
                  />
                </td>
              )}
              {columns.map((col) => (
                <td key={col.key} className="p-2">
                  {String(row[col.dataIndex])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
