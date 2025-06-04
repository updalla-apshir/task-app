import { getProjects } from "../../actions/project";

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
};

export type Project = {
  id: string;
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  status: "not-started" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  teamSize?: string;
  progress: number;
  teamMembers: TeamMember[];
  createdAt: Date;
  updatedAt: Date;
};

export const defaultTeamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Michael Newton",
    email: "michael@example.com",
  },
  {
    id: "2",
    name: "Alice Parker",
    email: "alice@example.com",
  },
  {
    id: "3",
    name: "David Smith",
    email: "david@example.com",
  },
  {
    id: "4",
    name: "Sarah Johnson",
    email: "sarah@example.com",
  },
  {
    id: "5",
    name: "Robert Wilson",
    email: "robert@example.com",
  },
];

export const defaultProjects = async (): Promise<Project[]> => {
  const data = await getProjects();
  return data.map(project => {
    // Map the status to one of the allowed values
    let mappedStatus: "not-started" | "in-progress" | "completed";
    switch (project.status?.toLowerCase()) {
      case "in progress":
      case "in-progress":
        mappedStatus = "in-progress";
        break;
      case "completed":
      case "done":
        mappedStatus = "completed";
        break;
      default:
        mappedStatus = "not-started";
    }

    return {
      ...project,
      description: project.description || undefined,
      priority: "medium",
      progress: 0,
      teamMembers: [],
      startDate: project.start_date || undefined,
      endDate: project.due_date || undefined,
      status: mappedStatus
    };
  });
};
