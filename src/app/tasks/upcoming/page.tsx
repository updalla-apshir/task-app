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
import { Calendar } from "lucide-react";
import { isAfter, isBefore, startOfToday, endOfWeek } from "date-fns";

function UpcomingTasksContent() {
  const { value } = useValue();
  const [open, setOpen] = React.useState(false);
  const [tasks, setTasks] = React.useState<Task[]>(() => {
    const today = startOfToday();
    const weekEnd = endOfWeek(today);
    return defaultTasks.filter((task) => {
      const taskDate = new Date(task.endAt);
      return isAfter(taskDate, today) && isBefore(taskDate, weekEnd);
    });
  });

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );
  };

  const completedTasks = tasks.filter(task => task.isCompleted);
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  // Group tasks by priority
  const highPriority = tasks.filter(task => task.priority === "HIGH").length;
  const mediumPriority = tasks.filter(task => task.priority === "MEDIUM").length;
  const lowPriority = tasks.filter(task => task.priority === "LOW").length;

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-none p-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-purple-500" />
            <h2 className="text-2xl font-bold tracking-tight">Upcoming Tasks</h2>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Plan ahead for the upcoming week. You have {tasks.length} task{tasks.length !== 1 ? "s" : ""} scheduled.
              </p>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span className="text-red-500">{highPriority} high priority</span>
                <span className="text-yellow-500">{mediumPriority} medium priority</span>
                <span className="text-green-500">{lowPriority} low priority</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium">
                {completedTasks.length}/{totalTasks} completed
              </div>
              <div className="h-2 w-20 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 transition-all duration-300"
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

export default function UpcomingTasksPage() {
  return (
    <ValueProvider>
      <UpcomingTasksContent />
    </ValueProvider>
  );
}
