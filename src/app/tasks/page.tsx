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
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { TaskProvider } from "@/contexts/TaskContext";

function TasksPageContent() {
  const { value, setValue } = useValue();
  const [open, setOpen] = React.useState(false);
  const { data: session } = useSession();
  const userId = session?.user?.id;

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
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
    enabled: !!userId,
  });

  if (isLoading) {
    return <div className="p-8 text-center">Loading tasks...</div>;
  }

  if (isError) {
    return <div className="p-8 text-center">Error loading tasks: {error?.message}</div>;
  }

  return (
    <TaskProvider initialTasks={tasks}>
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
              data={tasks}
              onTaskUpdate={() => refetch()}
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
