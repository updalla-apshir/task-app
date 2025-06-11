"use client";

import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import Topbar from "@/components/Topbar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DataTable } from "@/components/task-form/data-table";
import { Button } from "@/components/ui/button";
import { KanbanProvider } from "@/components/task-kanbanView/kanban";
import TaskKanban from "@/components/task-kanbanView/kanbanView";
import { useValue, ValueProvider } from "@/contexts/useContext";
import { TaskForm } from "@/components/Dialogs/taskForm";
import { columns } from "@/components/task-form/columns";
import { Task, defaultTasks } from "@/lib/data";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { TaskProvider } from "@/contexts/TaskContext";
import { updateTaskCompletionStatus } from "../../../actions/task";
import { toast } from "sonner";

function TasksPageContent() {
  const { value, setValue } = useValue();
  const [open, setOpen] = React.useState(false);
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();
  
  // Maintain local state of tasks that both views will use
  const [localTasks, setLocalTasks] = React.useState<Task[]>([]);

  // Fetch tasks query
  const {
    data: tasks = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Task[]>({
    queryKey: ["tasks", userId],
    queryFn: async () => {
      if (!userId) return [];
      return await defaultTasks(userId);
    },
    retry: 2,
    staleTime: 10000, // Reduce stale time to 10 seconds
    refetchOnWindowFocus: true, // Enable refetch on focus
    enabled: !!userId,
  });
  
  // Update local state whenever query data changes
  React.useEffect(() => {
    if (tasks && tasks.length > 0) {
      setLocalTasks(tasks);
    }
  }, [tasks]);

  // Shared task update handler
  const handleTaskUpdate = React.useCallback(async (updatedTask: Task) => {
    try {
      // Handle deleted tasks
      if (updatedTask.deleted) {
        return; // Already handled elsewhere
      }
      
      // Always update UI state immediately for optimistic updates
      setLocalTasks(prev => 
        prev.map(task => task.id === updatedTask.id ? updatedTask : task)
      );
      
      // If it's an optimistic update from a form submission
      if (updatedTask.isOptimistic) {
        console.log("Handling optimistic update:", updatedTask);
        
        // For completion status changes, always make sure we update the database
        if (typeof updatedTask.isCompleted === 'boolean') {
          try {
            const isCompleted = updatedTask.isCompleted;
            console.log(`Updating task ${updatedTask.id} completion status to ${isCompleted} (from form)`);
            const result = await updateTaskCompletionStatus(updatedTask.id, isCompleted);
            
            if (!result.success) {
              throw new Error(result.error || "Unknown error");
            }
          } catch (err) {
            console.error('Failed to update task status in DB:', err);
            toast.error("Failed to update task status in database");
          }
        }
        return;
      }
      
      // For direct checkbox clicks that don't come from the edit form
      if (typeof updatedTask.isCompleted === 'boolean' && !updatedTask.isOptimistic) {
        // We've already updated the UI state above
        
        // Update the server
        const isCompleted = updatedTask.isCompleted;
        console.log(`Updating task ${updatedTask.id} completion status to ${isCompleted} (direct)`);
        const result = await updateTaskCompletionStatus(updatedTask.id, isCompleted);
        
        if (result.success) {
          toast.success(isCompleted ? "Task completed!" : "Task marked as in progress");
        } else {
          toast.error(result.error || "Failed to update task");
          // Revert local state on error
          setLocalTasks(tasks);
        }
      }
    } catch (error) {
      console.error("Failed to update task:", error);
      toast.error("An error occurred while updating the task");
      // Revert on error
      setLocalTasks(tasks);
    }
  }, [tasks, setLocalTasks]);

  if (isLoading) {
    return <div className="p-8 text-center">Loading tasks...</div>;
  }

  if (isError) {
    return (
      <div className="p-8 text-center">
        Error loading tasks: {error?.message}
      </div>
    );
  }

  return (
    <TaskProvider 
      initialTasks={localTasks}
      onUpdateTask={handleTaskUpdate}
    >
      <div className="flex flex-col h-screen">
        <div className="flex-none p-4 ">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
            <div className="text-muted-foreground">
              <Button
                variant="default"
                size="sm"
                className="ml-auto h-8 lg:flex"
                onClick={() => setOpen(true)}
              >
                Add Task
              </Button>
              <TaskForm open={open} setOpen={setOpen} />
            </div>
          </div>
        </div>
        <div className="p-4">
          {value === "task" ? (
            <DataTable
              columns={columns}
              data={localTasks}
              onTaskUpdate={handleTaskUpdate}
            />
          ) : value === "kanban" ? (
            <KanbanProvider
              onDragEnd={(event) => console.log("Drag ended:", event)}
            >
              <TaskKanban />
            </KanbanProvider>
          ) : null}
        </div>
      </div>
    </TaskProvider>
  );
}

export default function TasksPage() {
  return (
    <ValueProvider>
      <TasksPageContent />
    </ValueProvider>
  );
}
