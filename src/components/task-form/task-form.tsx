"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Task } from "@/lib/data";

interface TaskFormProps {
  data: Task[];
  onTaskUpdate?: (updatedTask: Task) => void;
}

export function TaskForm({ data, onTaskUpdate }: TaskFormProps) {
  const handleTaskUpdate = React.useCallback((task: Task) => {
    onTaskUpdate?.(task);
  }, [onTaskUpdate]);

  return (
    <DataTable 
      columns={columns} 
      data={data} 
      onTaskUpdate={handleTaskUpdate}
    />
  );
}

export { DataTable };
