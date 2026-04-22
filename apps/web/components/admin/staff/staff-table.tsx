"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

export interface StaffRow {
  id: string;
  name: string;
  tier: "junior" | "senior" | "master";
  specialties: string[];
  isActive: boolean;
  bio?: string | null;
  email?: string | null;
  phone?: string | null;
}

interface StaffTableProps {
  staff: StaffRow[];
  onEdit: (id: string) => void;
}

const TIER_COLORS: Record<string, string> = {
  junior: "bg-blue-100 text-blue-800",
  senior: "bg-purple-100 text-purple-800",
  master: "bg-yellow-100 text-yellow-800",
};

const columnHelper = createColumnHelper<StaffRow>();

export function StaffTable({ staff, onEdit }: StaffTableProps) {
  const columns = [
    columnHelper.accessor("name", {
      header: "Name",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("tier", {
      header: "Tier",
      cell: (info) => (
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
            TIER_COLORS[info.getValue()] ?? "bg-gray-100 text-gray-600"
          }`}
        >
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("specialties", {
      header: "Specialties",
      cell: (info) => info.getValue().join(", ") || "—",
    }),
    columnHelper.accessor("isActive", {
      header: "Active",
      cell: (info) => (
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
            info.getValue()
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {info.getValue() ? "Active" : "Inactive"}
        </span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => onEdit(row.original.id)}
          className="rounded px-2 py-1 text-sm text-blue-600 hover:underline"
        >
          Edit
        </button>
      ),
    }),
  ];

  const table = useReactTable({
    data: staff,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b">
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-4 py-3 text-left font-medium">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b last:border-0 hover:bg-gray-50">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
