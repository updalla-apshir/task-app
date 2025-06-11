"use client";

import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";
import { Task } from "@/lib/data";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { TaskForm } from "../Dialogs/taskForm";
import { toast } from "sonner";
import { getProjects } from "../../../actions/project";
import { deleteTask } from "../../../actions/task";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const task = row.original as Task;
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const queryClient = useQueryClient();
  const session = useSession();
  const userId = session.data?.user?.id;
  if (!userId) {
    throw new Error("Unauthorized user");
  }

  // Fetch projects for the dropdown
  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
    staleTime: 60 * 1000, // 1 minute
  });

  // Find the project ID if available
  const projectName = task.project;
  const projectId = useMemo(() => {
    if (!projectName || !projects.length) return "";
    const project = projects.find((p) => p.name === projectName);
    return project?.id || "";
  }, [projectName, projects]);

  const handleTaskUpdate = async (updatedTask: any) => {
    if (updatedTask.error) {
      return;
    }
    setOpen(false);

    // Immediately update the React Query cache with the updated task
    queryClient.setQueryData(
      ["tasks", userId],
      (oldData: Task[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map((task) =>
          task.id === updatedTask.id ? updatedTask : task
        );
      }
    );

    // Also invalidate the query to ensure data consistency in the background
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ["tasks", userId] });
    }, 300);
  };

  // Function to handle delete
  const handleDeleteTask = async () => {
    // Close the modal first for immediate UI feedback
    setOpenDelete(false);
    
    // Create a deleted version of the task
    const deletedTask = {
      ...task,
      deleted: true,
      isOptimistic: true
    };
    
    // Optimistically remove the task from the cache
    queryClient.setQueryData(
      ["tasks", userId],
      (oldData: Task[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.filter((t) => t.id !== task.id);
      }
    );
    
    // Show a toast that can be reverted
    toast.promise(deleteTask(task.id), {
      loading: "Deleting task...",
      success: () => {
        // On success, just make sure our data is consistent
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ["tasks"] });
        }, 300);
        return `Task "${task.title}" deleted successfully`;
      },
      error: (err) => {
        // On error, restore the task by refetching
        queryClient.invalidateQueries({ queryKey: ["tasks", userId] });
        return "Failed to delete task: " + (err.message || "Unknown error");
      },
    });
  };

  // Format dates for the form
  const startDate = task.start_date ? new Date(task.start_date) : undefined;
  const dueDate = task.due_date ? new Date(task.due_date) : undefined;

  // Create initialData object with field names matching exactly what the form checks for
  const initialData = useMemo(
    () => ({
      id: task.id,
      title: task.title,
      description: task.desc || "",
      status: task.status.id === "2" ? "completed" : "pending",
      priority:
        task.priority === "LOW"
          ? "Low"
          : task.priority === "MEDIUM"
            ? "Medium"
            : "High",
      // Form explicitly checks for these property names in initialData
      start_date: startDate,
      due_date: dueDate,
      // Form explicitly checks for project_id in initialData
      project_id: projectId,
      createdBy: userId,
      // Add project object for reference
      project: { name: task.project },
    }),
    [task, userId, startDate, dueDate, projectId]
  );

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(false);
              setOpen(true);
            }}
          >
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem>Make a copy</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => {
              setOpenDelete(true);
            }}
          >
            Delete
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <TaskForm
        open={open}
        setOpen={setOpen}
        currentUserId={userId}
        onSubmit={handleTaskUpdate}
        initialData={initialData}
        projects={projects}
      />

      {/* Delete confirmation dialog */}
      {openDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full dark:bg-black dark:text-white">
            <h3 className="text-lg font-semibold">Delete Task</h3>
            <p className="py-4">
              Are you sure you want to delete this task? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setOpenDelete(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteTask}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
