"use client";

import * as React from "react";
import { DataTable } from "@/components/task-form/data-table";
import { columns } from "@/components/task-form/columns";
import { Task, defaultTasks } from "@/lib/data";
import { KanbanProvider } from "@/components/task-kanbanView/kanban";
import TaskKanban from "@/components/task-kanbanView/kanbanView";
import { useValue, ValueProvider } from "@/contexts/useContext";
import { TaskProvider } from "@/contexts/TaskContext";
import { CalendarDays } from "lucide-react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { TableSkeleton } from "@/components/ui/skeletons";

function TodayTasksContent() {
  const { value } = useValue();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // Use React Query to fetch tasks
  const { data: allTasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["tasks", userId],
    queryFn: async () => {
      if (!userId) return [];
      return await defaultTasks(userId);
    },
    enabled: !!userId,
    staleTime: 30000,
  });

  // Filter for today's tasks
  const tasks = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return allTasks.filter((task) => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === today.getTime();
    });
  }, [allTasks]);

  const handleTaskUpdate = (updatedTask: Task) => {
    // This will be handled by the TaskProvider and parent components
  };

  const completedTasks = tasks.filter((task) => task.isCompleted);
  const totalTasks = tasks.length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  if (isLoading) return <TableSkeleton />;

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-none p-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-blue-500" />
            <h2 className="text-2xl font-bold tracking-tight">Today's Tasks</h2>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Focus on what needs to be done today. You have {tasks.length} task
              {tasks.length !== 1 ? "s" : ""} scheduled.
            </p>
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium">
                {completedTasks.length}/{totalTasks} completed
              </div>
              <div className="h-2 w-20 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4">
        {value === "task" ? (
          <DataTable
            columns={columns}
            data={tasks}
            onTaskUpdate={handleTaskUpdate}
          />
        ) : value === "kanban" ? (
          <TaskProvider initialTasks={tasks} onUpdateTask={handleTaskUpdate}>
            <KanbanProvider
              onDragEnd={(event) => console.log("Drag ended:", event)}
            >
              <TaskKanban />
            </KanbanProvider>
          </TaskProvider>
        ) : null}
      </div>
    </div>
  );
}

export default function TodayTasksPage() {
  return (
    <ValueProvider>
      <TodayTasksContent />
    </ValueProvider>
  );
}
