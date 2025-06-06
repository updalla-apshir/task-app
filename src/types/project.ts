import { Task } from "./task";
import { User } from "./user";
import { Team } from "./team";

export type ProjectStatus = "not_started" | "in_progress" | "completed"; // Adjust based on your enum

export type Project = {
  id: string;
  name: string;
  description?: string | null;
  start_date?: Date | null;
  due_date?: Date | null;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
  owner: User; // You should define `User` interface separately
  ownerId: string;
  team?: Team; // You should define `Team` interface separately
  teamId?: string | null;
  tasks: Task[]; // You should define `Task` interface separately
};
