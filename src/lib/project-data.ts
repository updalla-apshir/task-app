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

export const defaultProjects: Project[] = [
  {
    id: "1",
    name: "Website Redesign",
    description: "Complete overhaul of company website with modern design",
    startDate: new Date("2024-03-01"),
    endDate: new Date("2024-06-30"),
    status: "in-progress",
    priority: "high",
    teamSize: "5",
    progress: 45,
    teamMembers: [defaultTeamMembers[0], defaultTeamMembers[1], defaultTeamMembers[2]],
    createdAt: new Date("2024-02-15"),
    updatedAt: new Date("2024-02-15"),
  },
  {
    id: "2",
    name: "Mobile App Development",
    description: "Develop a new mobile app for customer engagement",
    startDate: new Date("2024-04-01"),
    endDate: new Date("2024-09-30"),
    status: "not-started",
    priority: "medium",
    teamSize: "8",
    progress: 0,
    teamMembers: [defaultTeamMembers[1], defaultTeamMembers[3], defaultTeamMembers[4]],
    createdAt: new Date("2024-02-20"),
    updatedAt: new Date("2024-02-20"),
  },
  {
    id: "3",
    name: "Data Migration",
    description: "Migrate legacy data to new cloud platform",
    startDate: new Date("2024-02-01"),
    endDate: new Date("2024-03-15"),
    status: "completed",
    priority: "high",
    teamSize: "3",
    progress: 100,
    teamMembers: [defaultTeamMembers[0], defaultTeamMembers[4]],
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-03-15"),
  },
]; 