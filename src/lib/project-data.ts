import { getProjects } from "../../actions/project";
import { ProjectStatus, TaskPriority } from "@prisma/client";
import { getTasksForUser } from "../../actions/task";
import { auth } from "./auth";

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

export const defaultProjects = async (userId?: string): Promise<Project[]> => {
  try {
    if (!userId) {
      console.log("No userId provided");
      return [];
    }

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

    // 👇 Fetch all tasks for all projects (optional: if per user, pass userId)
    const allTasks = await getTasksForUser(userId); // Pass userId if needed

    const transformedData = data.map((item: ProjectApiResponse) => {
      // 👇 Filter tasks that belong to this project
      const projectTasks = allTasks.filter(
        (task) => task.project?.id === item.id
      );

      // Calculate progress and update status based on progress
      let progress = 0;
      if (projectTasks.length > 0) {
        const completedTasks = projectTasks.filter(
          (task) => task.status === "completed"
        ).length;
        progress = Math.round((completedTasks / projectTasks.length) * 100);
      }

      // Determine status based on progress
      let status = item.status;
      if (progress === 100) {
        status = "completed";
      } else if (progress > 0) {
        status = "in_progress";
      } else {
        status = "not_started";
      }

      const teamMembers = Array.isArray(item.assignedTo)
        ? item.assignedTo.map((assignment) => ({
            id: assignment?.user?.id || "",
            name: assignment?.user?.name || "Unknown",
            email: assignment?.user?.email || "",
            avatar: assignment?.user?.image || "",
          }))
        : [];

      const project: Project = {
        id: item.id,
        name: item.name,
        description: item.description || "",
        startDate: item.start_date,
        endDate: item.due_date,
        status: status,
        priority: item.priority,
        teamSize: String(teamMembers.length || 1),
        progress,
        teamMembers,
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
