"use client";

import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import Topbar from "@/components/Topbar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DataTable } from "@/components/task-form/task-form";
import { columns } from "@/components/task-form/columns";
import { Button } from "@/components/ui/button";
import { KanbanProvider } from "@/components/task-kanbanView/kanban";
import TaskKanban from "@/components/task-kanbanView/kanbanView";
import { useValue, ValueProvider } from "@/hooks/useContext";
import { FormDialog } from "@/components/Dialogs/taskForm"; // Adjust path if needed

// Fake data
const tasks = [
  {
    id: "TASK-8782",
    title:
      "You can't compress the program without quantifying the open-source SSD pixel!",
    status: "in_progress",
    label: "documentation",
    priority: "high",
  },
  {
    id: "TASK-7878",
    title:
      "Try to calculate the EXE feed, maybe it will index the multi-byte pixel!",
    status: "backlog",
    label: "documentation",
    priority: "low",
  },
  {
    id: "TASK-7533",
    title: "We need to bypass the neural TCP card!",
    status: "todo",
    label: "bug",
    priority: "medium",
  },
];

function TasksPageContent() {
  const { value, setValue } = useValue();
  const [open, setOpen] = React.useState(false);

  return (
    <main className="p-4 md:p-4 space-y-4 flex-1 overflow-auto">
      <div className="flex flex-col gap-8">
        <div>
          <div className="flex justify-between">
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
              <FormDialog open={open} setOpen={setOpen} />
            </div>
          </div>
        </div>
        <div className="w-full overflow-hidden">
          {value === "task" ? (
            <DataTable data={tasks} columns={columns} />
          ) : value === "kanban" ? (
            <TaskKanban />
          ) : null}
        </div>
      </div>
    </main>
  );
}

export default function TasksPage() {
  return (
    <ValueProvider>
      <TasksPageContent />
    </ValueProvider>
  );
}
