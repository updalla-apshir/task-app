"use client";

import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import Topbar from "@/components/Topbar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { KanbanProvider } from "@/components/projects/kanban";
import { useValue, ValueProvider } from "@/contexts/useContext";
import { ProjectForm } from "@/components/Dialogs/projectForm";
import { columns } from "@/components/project-form/columns";
import { Project, defaultProjects } from "@/lib/project-data";
import ProjectKanban from "@/components/projects/kanbanView";
import { DataTable } from "@/components/project-form/data-table";
import { Feature, Status } from "@/components/projects/kanban";
import { useSession } from "next-auth/react";

type ProjectFormData = {
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  status: "not-started" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  teamSize?: string;
};

const statusMap: Record<Project["status"], Status> = {
  "not-started": { id: "1", name: "Planned", color: "#94A3B8" },
  "in-progress": { id: "2", name: "In Progress", color: "#F59E0B" },
  completed: { id: "3", name: "Done", color: "#10B981" },
};

const priorityMap: Record<Project["priority"], Feature["priority"]> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

function ProjectsPageContent() {
  const { value, setValue } = useValue();
  const [open, setOpen] = React.useState(false);
  const [projects, setProjects] = React.useState<Project[]>(defaultProjects);

  const session = useSession();

  const userId = session.data?.user?.id;

  const handleProjectUpdate = (updatedProject: Project) => {
    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project.id === updatedProject.id ? updatedProject : project
      )
    );
  };

  const handleProjectCreate = (formData: ProjectFormData) => {
    const project: Project = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      teamMembers: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setProjects((currentProjects) => [...currentProjects, project]);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <main className="flex-1 flex flex-col min-h-0 w-full max-w-full">
        <div className="p-4 flex-none">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
            <div className="text-muted-foreground">
              <Button
                variant="default"
                size="sm"
                className="ml-auto h-8 lg:flex"
                onClick={() => setOpen(true)}
              >
                Add Project
              </Button>
              <ProjectForm
                open={open}
                setOpen={setOpen}
                onSubmit={handleProjectCreate}
                currentUserId={userId ?? ""}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 p-4 w-full">
          {value === "kanban" ? (
            <KanbanProvider>
              <ProjectKanban />
            </KanbanProvider>
          ) : (
            <div className="h-full w-full">
              <DataTable
                columns={columns}
                data={projects || []}
                onProjectUpdate={handleProjectUpdate}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ProjectPage() {
  return (
    <ValueProvider>
      <ProjectsPageContent />
    </ValueProvider>
  );
}
