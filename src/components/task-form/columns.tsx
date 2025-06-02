"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { Task, priorities, statuses } from "@/lib/data";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import { format, isValid } from "date-fns";

export const columns: ColumnDef<Task>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row, table }) => (
      <Checkbox
        checked={row.original.isCompleted}
        onCheckedChange={(value) => {
          if (typeof value === "boolean") {
            const updatedTask = {
              ...row.original,
              isCompleted: value,
              status: value 
                ? { id: "2", name: "Completed", color: "#10B981" }
                : { id: "1", name: "In Progress", color: "#F59E0B" }
            };
            row.original.isCompleted = value;
            row.original.status = updatedTask.status;
            (table.options.meta as any)?.onTaskUpdate?.(updatedTask);
          }
        }}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Task" />
    ),
    cell: ({ row }) => {
      const task = row.original;
      return (
        <div className="flex flex-col">
          <span className={`font-medium ${task.isCompleted ? "line-through text-gray-500" : ""}`}>
            {task.name}
          </span>
          {task.desc && (
            <span className={`text-sm text-gray-500 ${task.isCompleted ? "line-through" : ""}`}>
              {task.desc}
            </span>
          )}
        </div>
      );
    },
    enableHiding: false,
  },
  {
    id: "status",
    accessorFn: (row) => row.status.id,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const statusId = row.getValue("status") as string;
      const status = row.original.status;
      const statusDef = statuses.find(s => s.value === statusId);

      return (
        <div className="flex w-[100px] items-center">
          {statusDef?.icon && (
            <statusDef.icon className="mr-2 h-4 w-4" style={{ color: statusDef.color }} />
          )}
          <span style={{ color: statusDef?.color }}>{status.name}</span>
        </div>
      );
    },
    filterFn: (row, id, value: string[]) => {
      const statusId = row.getValue(id) as string;
      return value.includes(statusId);
    },
  },
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Priority" />
    ),
    cell: ({ row }) => {
      const priority = priorities.find(
        (p) => p.value === row.getValue("priority")
      );

      if (!priority) {
        return null;
      }

      return (
        <div className="flex items-center">
          {priority.icon && (
            <priority.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{priority.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value: string[]) => {
      return value.includes(row.getValue("priority"));
    },
  },
  {
    accessorKey: "endAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Due Date" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("endAt");
      let date: Date;
      
      // Handle both string and Date types
      if (value instanceof Date) {
        date = value;
      } else if (typeof value === 'string') {
        date = new Date(value);
      } else {
        return <div className="text-gray-500">Invalid date</div>;
      }
      
      if (!isValid(date)) {
        return <div className="text-gray-500">Invalid date</div>;
      }
      
      return <div>{format(date, "MMM d, yyyy")}</div>;
    },
  },
  {
    accessorKey: "project",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Project" />
    ),
    cell: ({ row }) => {
      const project = row.getValue("project") as string;
      return project ? (
        <Badge variant="outline">{project}</Badge>
      ) : null;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
    enableHiding: false,
  },
];
