"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

export interface ServiceRow {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  pricingCount: number;
}

interface ServicesTableProps {
  services: ServiceRow[];
  onEdit: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}

const columnHelper = createColumnHelper<ServiceRow>();

export function ServicesTable({ services, onEdit, onToggleActive }: ServicesTableProps) {
  const columns = [
    columnHelper.accessor("name", {
      header: "Name",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("description", {
      header: "Description",
      cell: (info) => (
        <span className="truncate max-w-xs block">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("pricingCount", {
      header: "Pricing Tiers",
      cell: (info) => info.getValue(),
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
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(row.original.id)}
            className="rounded px-2 py-1 text-sm text-blue-600 hover:underline"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onToggleActive(row.original.id, row.original.isActive)}
            className="rounded px-2 py-1 text-sm text-gray-600 hover:underline"
          >
            {row.original.isActive ? "Deactivate" : "Activate"}
          </button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: services,
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
