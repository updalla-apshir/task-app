import {
  Circle,
  CheckCircle2,
  ArrowUp,
  ArrowRight,
  ArrowDown,
} from "lucide-react";
import { getTasksForUser } from "../../actions/task";

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
  title: string;
  desc?: string;
  start_date: string | Date;
  due_date: string | Date;
  status: Status;
  priority: Priority;
  isCompleted: boolean;
  project: string;
};

// Helper function to ensure dates are properly formatted
function createTask(
  task: Omit<Task, "start_date" | "due_date"> & {
    startAt: string;
    endAt: string;
  }
): Task {
  return {
    ...task,
    start_date: new Date(task.startAt),
    due_date: new Date(task.endAt),
  };
}

export async function defaultTasks(userId?: string): Promise<Task[]> {
  const tasks = await getTasksForUser(userId);
  console.log(tasks);

  if (!tasks || tasks.length === 0) {
    return [];
  }

  return tasks.map((task) =>
    createTask({
      id: task.id,
      title: task.title,
      desc: task.description || "",
      startAt: task.start_date
        ? new Date(task.start_date).toISOString()
        : new Date().toISOString(),
      endAt: task.due_date
        ? new Date(task.due_date).toISOString()
        : new Date().toISOString(),
      status: {
        id: String(task.status || "1"),
        name: task.status === "completed" ? "Completed" : "In Progress",
        color: task.status === "completed" ? "#10B981" : "#3B82F6",
      },
      priority: task.priority
        ? (task.priority.toUpperCase() as Priority)
        : "LOW",
      isCompleted: task.status === "completed",
      project: task.project.name,
    })
  );
}
