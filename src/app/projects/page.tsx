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
import ProjectKanban from "@/components/projects/kanbanView";

function TasksPageContent() {
  const { value, setValue } = useValue();
  const [open, setOpen] = React.useState(false);
  const [tasks, setTasks] = React.useState<Task[]>(defaultTasks);

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-none p-4 ">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
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
            onTaskUpdate={handleTaskUpdate}
          />
        ) : value === "kanban" ? (
          <KanbanProvider
            onDragEnd={(event) => console.log("Drag ended:", event)}
          >
            <ProjectKanban />
          </KanbanProvider>
        ) : null}
      </div>
    </div>
  );
}

export default function ProjectPage() {
  return (
    <ValueProvider>
      <TasksPageContent />
    </ValueProvider>
  );
}
