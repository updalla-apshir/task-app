import { User } from "./user";

export interface Team {
  id: string;
  name: string;
  description?: string;
  members: User[];
  createdAt: Date;
  updatedAt: Date;
} 