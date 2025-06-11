"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { Task, priorities, statuses } from "@/lib/data";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import { updateTaskCompletionStatus } from "../../../actions/task";
import { toast } from "sonner";
import {
  format,
  isValid,
  isToday,
  isThisWeek,
  isThisMonth,
  isBefore,
  startOfToday,
} from "date-fns";

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
        onCheckedChange={async (value) => {
          if (typeof value === "boolean") {
            // Capture task ID upfront for better debugging
            const taskId = row.original.id;
            console.log(`Checkbox changed for task ${taskId}:`, value);
            
            try {
              // First call the API directly
              console.log(`Calling updateTaskCompletionStatus directly for ${taskId}`);
              const result = await updateTaskCompletionStatus(taskId, value);
              console.log("Direct API call result:", result);
              
              if (result.success) {
                // Now update UI
                const updatedTask = {
                  ...row.original,
                  isCompleted: value,
                  status: value
                    ? { id: "2", name: "Completed", color: "#10B981" }
                    : { id: "1", name: "In Progress", color: "#F59E0B" },
                  isOptimistic: true
                };
                
                // Update UI via React Query
                (table.options.meta as any)?.onTaskUpdate?.(updatedTask);
              } else {
                console.error("Failed to update task directly:", result.error);
                toast.error("Failed to update task: " + result.error);
              }
            } catch (err) {
              console.error("Error during direct task update:", err);
              toast.error("Error updating task");
            }
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
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Task" />
    ),
    cell: ({ row }) => {
      const task = row.original;
      return (
        <div className="flex flex-col">
          <span
            className={`font-medium ${task.isCompleted ? "line-through text-gray-500" : ""}`}
          >
            {task.title}
          </span>
          {task.desc && (
            <span
              className={`text-sm text-gray-500 ${task.isCompleted ? "line-through" : ""}`}
            >
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
      const statusDef = statuses.find((s) => s.value === statusId);

      return (
        <div className="flex w-[100px] items-center">
          {statusDef?.icon && (
            <statusDef.icon
              className="mr-2 h-4 w-4"
              style={{ color: statusDef.color }}
            />
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
    accessorKey: "due_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Due Date" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("due_date");
      let date: Date;

      // Handle both string and Date types
      if (value instanceof Date) {
        date = value;
      } else if (typeof value === "string") {
        date = new Date(value);
      } else {
        return <div className="text-gray-500">Invalid date</div>;
      }

      if (!isValid(date)) {
        return <div className="text-gray-500">Invalid date</div>;
      }

      return <div>{format(date, "MMM d, yyyy")}</div>;
    },
    filterFn: (row, id, filterValue: { type: "relative"; value: string }) => {
      const value = row.getValue(id);
      if (!value) return false;

      const taskDate =
        value instanceof Date ? value : new Date(value as string);
      if (!isValid(taskDate)) return false;

      const today = startOfToday();

      switch (filterValue.value) {
        case "today":
          return isToday(taskDate);
        case "this-week":
          return isThisWeek(taskDate);
        case "this-month":
          return isThisMonth(taskDate);
        case "overdue":
          return isBefore(taskDate, today);
        case "all":
          return true;
        default:
          return false;
      }
    },
  },
  {
    accessorKey: "project",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Project" />
    ),
    cell: ({ row }) => {
      const project = row.getValue("project");
      // Handle both string and object formats
      const projectName = typeof project === 'object' && project !== null
        ? (project as any).name || "Unknown Project"
        : project as string || "Unknown Project";
        
      return projectName ? <Badge variant="outline">{projectName}</Badge> : null;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
    enableHiding: false,
  },
];
