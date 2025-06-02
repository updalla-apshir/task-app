import {
  Circle,
  CheckCircle2,
  ArrowUp,
  ArrowRight,
  ArrowDown,
} from "lucide-react";

export type Priority = "HIGH" | "MEDIUM" | "LOW";

export const priorities = [
  {
    label: "High Priority",
    value: "HIGH",
    icon: ArrowUp,
    color: "#EF4444",
  },
  {
    label: "Medium Priority",
    value: "MEDIUM",
    icon: ArrowRight,
    color: "#F59E0B",
  },
  {
    label: "Low Priority",
    value: "LOW",
    icon: ArrowDown,
    color: "#10B981",
  },
] as const;

export const statuses = [
  {
    label: "In Progress",
    value: "1",
    icon: ArrowRight,
    color: "#F59E0B",
  },
  {
    label: "Completed",
    value: "2",
    icon: CheckCircle2,
    color: "#10B981",
  },
] as const;

export type Status = {
  id: string;
  name: string;
  color: string;
};

export type Task = {
  id: string;
  name: string;
  desc?: string;
  startAt: string | Date;
  endAt: string | Date;
  status: Status;
  priority: Priority;
  isCompleted: boolean;
  project?: string;
};

// Helper function to ensure dates are properly formatted
function createTask(
  task: Omit<Task, "startAt" | "endAt"> & { startAt: string; endAt: string }
): Task {
  return {
    ...task,
    startAt: new Date(task.startAt),
    endAt: new Date(task.endAt),
  };
}

export const defaultTasks: Task[] = [
  createTask({
    id: "1",
    name: "Implement User Authentication",
    desc: "Set up user authentication system with JWT tokens",
    startAt: "2024-03-01",
    endAt: "2024-03-15",
    status: { id: "1", name: "In Progress", color: "#F59E0B" },
    priority: "HIGH",
    isCompleted: false,
    project: "Auth System",
  }),
  createTask({
    id: "2",
    name: "Design Dashboard UI",
    desc: "Create responsive dashboard layout with modern design",
    startAt: "2024-03-05",
    endAt: "2024-03-20",
    status: { id: "1", name: "In Progress", color: "#F59E0B" },
    priority: "MEDIUM",
    isCompleted: false,
    project: "Frontend",
  }),
  createTask({
    id: "3",
    name: "API Documentation",
    desc: "Document all API endpoints with examples",
    startAt: "2024-02-28",
    endAt: "2024-03-10",
    status: { id: "2", name: "Completed", color: "#10B981" },
    priority: "LOW",
    isCompleted: true,
    project: "Backend",
  }),
];
