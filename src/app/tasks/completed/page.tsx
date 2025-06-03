"use client";

import * as React from "react";
import { DataTable } from "@/components/task-form/data-table";
import { Button } from "@/components/ui/button";
import { TaskForm } from "@/components/Dialogs/taskForm";
import { columns } from "@/components/task-form/columns";
import { Task, defaultTasks } from "@/lib/data";
import { KanbanProvider } from "@/components/task-kanbanView/kanban";
import TaskKanban from "@/components/task-kanbanView/kanbanView";
import { useValue, ValueProvider } from "@/contexts/useContext";
import { TaskProvider } from "@/contexts/TaskContext";
import { CheckCircle2 } from "lucide-react";
import { format, isToday, isThisWeek } from "date-fns";

function CompletedTasksContent() {
  const { value } = useValue();
  const [open, setOpen] = React.useState(false);
  const [tasks, setTasks] = React.useState<Task[]>(() => {
    return defaultTasks.filter((task) => task.isCompleted);
  });

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );
  };

  // Calculate completion statistics
  const totalTasks = tasks.length;
  const completedToday = tasks.filter(task => isToday(new Date(task.endAt))).length;
  const completedThisWeek = tasks.filter(task => isThisWeek(new Date(task.endAt))).length;

  // Group tasks by priority
  const highPriority = tasks.filter(task => task.priority === "HIGH").length;
  const mediumPriority = tasks.filter(task => task.priority === "MEDIUM").length;
  const lowPriority = tasks.filter(task => task.priority === "LOW").length;

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-none p-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            <h2 className="text-2xl font-bold tracking-tight">Completed Tasks</h2>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Great job! You've completed {totalTasks} task{totalTasks !== 1 ? "s" : ""}.
              </p>
              <div className="flex gap-4 text-xs">
                <div className="flex flex-col">
                  <span className="text-green-500 font-medium">{completedToday}</span>
                  <span className="text-muted-foreground">Today</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-green-500 font-medium">{completedThisWeek}</span>
                  <span className="text-muted-foreground">This Week</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                {highPriority} high
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                {mediumPriority} medium
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                {lowPriority} low
              </span>
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

export default function CompletedTasksPage() {
  return (
    <ValueProvider>
      <CompletedTasksContent />
    </ValueProvider>
  );
}
