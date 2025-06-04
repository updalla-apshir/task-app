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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTeam } from "../../../actions/team";
import { createProject } from "../../../actions/project";
import * as z from "zod";
import { useRouter } from "next/navigation";

interface TeamMember {
  id: string;
  role: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
  };
}

interface Team {
  id: string;
  name: string;
  members: TeamMember[];
  projects: any[];
}

interface EmptyTeam {
  members: TeamMember[];
}

const formSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  status: z.enum(["not-started", "in-progress", "completed"]),
  priority: z.enum(["low", "medium", "high"]),
  assignedTo: z
    .array(z.string())
    .min(1, "At least one team member must be assigned"),
});

type ProjectFormValues = z.infer<typeof formSchema>;

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

  const queryClient = useQueryClient();

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: defaultProjects,
  });

  const updateProjectMutation = useMutation({
    mutationFn: (updatedProject: Project) => {
      // TODO: Implement the API call to update the project
      return Promise.resolve(updatedProject);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const handleProjectUpdate = (updatedProject: Project) => {
    updateProjectMutation.mutate(updatedProject);
  };

  const session = useSession();
  const userId = session.data?.user?.id;
  const router = useRouter();

  // Fetch team data
  const { data: teamData } = useQuery<Team | EmptyTeam>({
    queryKey: ["team"],
    queryFn: async () => {
      const result = await getTeam();
      return result as Team | EmptyTeam;
    },
  });

  // Transform team members data for the ProjectForm
  const teamMembers = React.useMemo(() => {
    if (!teamData?.members) return [];
    return teamData.members.map((member: TeamMember) => ({
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      image: member.user.image,
    }));
  }, [teamData]);

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
                currentUserId={userId ?? ""}
                teamMembers={teamMembers}
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
