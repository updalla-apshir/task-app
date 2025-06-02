"use client";

import * as React from "react";
import { isToday, startOfToday, endOfToday } from "date-fns";
import { DataTable } from "@/components/task-form/data-table";
import { columns } from "@/components/task-form/columns";
import { Task } from "@/components/data/schema";
import { ValueProvider } from "@/contexts/KanbanContext";

// Demo data for today's tasks
const todayTasks: Task[] = [
  {
    id: "TODAY-1",
    title: "Complete Project Presentation",
    priority: "HIGH",
    completed: false,
    dueDate: new Date(),
    project: "Marketing",
  },
  {
    id: "TODAY-2",
    title: "Review Team Updates",
    priority: "MEDIUM",
    completed: false,
    dueDate: new Date(),
    project: "Management",
  },
  {
    id: "TODAY-3",
    title: "Send Client Proposal",
    priority: "HIGH",
    completed: true,
    dueDate: new Date(),
    project: "Sales",
  },
  {
    id: "TODAY-4",
    title: "Update Documentation",
    priority: "LOW",
    completed: false,
    dueDate: new Date(),
    project: "Development",
  },
];

function TodayTasksContent() {
  const [tasks, setTasks] = React.useState<Task[]>(todayTasks);

  // This will be replaced with a database call later
  React.useEffect(() => {
    // Simulating data fetch
    const fetchTodayTasks = () => {
      // In the future, this will be a database query to get tasks where:
      // dueDate >= startOfToday() AND dueDate <= endOfToday()
      const today = new Date();
      const tasksForToday = todayTasks.map((task) => ({
        ...task,
        dueDate: today,
      }));
      setTasks(tasksForToday);
    };

    fetchTodayTasks();
  }, []);

  return (
    <main className="p-4 md:p-4 space-y-4 flex-1 overflow-auto">
      <div className="flex flex-col gap-8">
        <div>
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Today's Tasks</h2>
            <div className="text-muted-foreground">
              {tasks.length} tasks due today
            </div>
          </div>
        </div>
        <div className="w-full overflow-hidden">
          <DataTable columns={columns} data={tasks} />
        </div>
      </div>
    </main>
  );
}

export default function TodayTasksPage() {
  return (
    <ValueProvider>
      <TodayTasksContent />
    </ValueProvider>
  );
}
