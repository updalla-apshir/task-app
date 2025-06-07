import { getProjects } from "../../actions/project";
import { ProjectStatus, TaskPriority } from "@prisma/client";

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
};

export type Project = {
  id: string;
  name: string;
  description?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  status: "not_started" | "in_progress" | "completed";
  priority: "Low" | "Medium" | "High";
  teamSize?: string;
  progress: number;
  teamMembers: TeamMember[];
  createdAt: Date;
  updatedAt: Date;
};

// Define the shape of data returned by the API
export interface ProjectApiResponse {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: TaskPriority;
  start_date: Date | null;
  due_date: Date | null;
  createdAt: Date;
  updatedAt?: Date;
  ownerId: string;
  owner: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  assignedTo: Array<{
    user: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    };
  }>;
  tasks?: Array<{ status: string }>;
}

export const defaultProjects = async (): Promise<Project[]> => {
  try {
    const data = await getProjects();
    console.log("Fetched raw project data:", data);

    if (!data || !Array.isArray(data)) {
      console.log("No project data or invalid data format received");
      return [];
    }

    if (data.length === 0) {
      console.log("No projects found");
      return [];
    }

    const transformedData = data.map((item: ProjectApiResponse) => {
      // Calculate progress based on tasks
      let progress = 0;
      const tasks = item.tasks || [];

      if (tasks.length > 0) {
        const completedTasks = tasks.filter(
          (task) => task.status === "completed"
        ).length;
        progress = Math.round((completedTasks / tasks.length) * 100);
      }

      // Transform assignedTo data safely
      const teamMembers = Array.isArray(item.assignedTo)
        ? item.assignedTo.map((assignment) => ({
            id: assignment?.user?.id || "",
            name: assignment?.user?.name || "Unknown",
            email: assignment?.user?.email || "",
            avatar: assignment?.user?.image || "",
          }))
        : [];

      // Ensure all required fields have values
      const project: Project = {
        id: item.id,
        name: item.name,
        description: item.description || "",
        startDate: item.start_date,
        endDate: item.due_date,
        status: item.status,
        priority: item.priority,
        teamSize: String(teamMembers.length || 1),
        progress: progress,
        teamMembers: teamMembers,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt || item.createdAt || new Date(),
      };
      return project;
    });

    console.log("Transformed project data:", transformedData);
    return transformedData;
  } catch (error) {
    console.error("Error transforming project data:", error);
    return [];
  }
};
