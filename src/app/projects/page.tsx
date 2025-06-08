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
import * as z from "zod";
import { useRouter } from "next/navigation";
import { projectSchema } from "../../schemas/shema";
import { toast } from "sonner";

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

type ProjectFormValues = z.infer<typeof projectSchema>;

const statusMap: Record<Project["status"], Status> = {
  not_started: { id: "1", name: "Planned", color: "#94A3B8" },
  in_progress: { id: "2", name: "In Progress", color: "#F59E0B" },
  completed: { id: "3", name: "Done", color: "#10B981" },
};

const priorityMap: Record<Project["priority"], Feature["priority"]> = {
  Low: "Low",
  Medium: "Medium",
  High: "High",
};

function ProjectsPageContent() {
  const { value, setValue } = useValue();
  const [open, setOpen] = React.useState(false);

  const queryClient = useQueryClient();
  const session = useSession();
  const userId = session.data?.user?.id;
  const router = useRouter();

  // Fetch projects query
  const {
    data: projects = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: defaultProjects,
    retry: 2,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  console.log("Projects data:", projects);

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

  // Prefetch projects data
  React.useEffect(() => {
    // Prefetch projects data
    queryClient.prefetchQuery({
      queryKey: ["projects"],
      queryFn: defaultProjects,
    });
  }, [queryClient]);

  // Handle project form submission
  const handleProjectSubmit = async (status: string) => {
    if (status === "success") {
      // The form component already called createProject
      // Just invalidate the cache to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    }
  };

  return (
    <div className="flex flex-col overflow-hidden">
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
                onSubmit={handleProjectSubmit}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 p-4 w-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p>Loading projects...</p>
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center h-full">
              <p>Error loading projects. Please try again.</p>
            </div>
          ) : Array.isArray(projects) && projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <p className="text-lg text-muted-foreground">No projects found</p>
              <Button onClick={() => setOpen(true)}>
                Create your first project
              </Button>
            </div>
          ) : value === "kanban" ? (
            <KanbanProvider>
              <ProjectKanban />
            </KanbanProvider>
          ) : (
            <div className="h-full w-full">
              <DataTable
                columns={columns}
                data={Array.isArray(projects) ? projects : []}
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
