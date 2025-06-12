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
  isOptimistic?: boolean;
  deleted?: boolean;
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

// Helper function to ensure task data from form is properly formatted
export function formatTaskFromForm(taskData: any): Task {
  // Check for status coming from the checkbox
  const isCompleted = typeof taskData.status === 'string' 
    ? taskData.status === "completed" 
    : (taskData.status && (taskData.status.name === "Completed" || taskData.status.id === "2"));
  
  // Get project name, handling different formats
  const projectName = typeof taskData.project === 'object' && taskData.project !== null
    ? taskData.project.name
    : typeof taskData.project === 'string'
      ? taskData.project
      : "Unknown Project";
  
  // Handle the case where isCompleted is explicitly provided
  const completed = typeof taskData.is_completed === 'boolean' 
    ? taskData.is_completed 
    : isCompleted;
  
  // Normalize priority to uppercase for frontend consistency
  let priority: Priority = "MEDIUM";
  if (typeof taskData.priority === 'string') {
    // Handle both uppercase and lowercase priority values
    const normalizedPriority = taskData.priority.toUpperCase();
    if (normalizedPriority === "HIGH" || normalizedPriority === "MEDIUM" || normalizedPriority === "LOW") {
      priority = normalizedPriority as Priority;
    } else if (normalizedPriority === "LOW" || taskData.priority === "Low") {
      priority = "LOW";
    } else if (normalizedPriority === "MEDIUM" || taskData.priority === "Medium") {
      priority = "MEDIUM";
    } else if (normalizedPriority === "HIGH" || taskData.priority === "High") {
      priority = "HIGH";
    }
  }
  
  return {
    id: taskData.id || `temp-${Date.now()}`,
    title: taskData.title || "",
    desc: taskData.description || "",
    start_date: taskData.startDate || taskData.start_date || new Date(),
    due_date: taskData.endDate || taskData.due_date || new Date(),
    status: {
      id: completed ? "2" : "1",
      name: completed ? "Completed" : "In Progress",
      color: completed ? "#10B981" : "#3B82F6",
    },
    priority: priority,
    isCompleted: completed,
    project: projectName,
    isOptimistic: !!taskData.isOptimistic,
    deleted: !!taskData.deleted
  };
}

export async function defaultTasks(userId?: string): Promise<Task[]> {
  const tasks = await getTasksForUser(userId);

  if (!tasks || tasks.length === 0) {
    return [];
  }

  console.log("Raw tasks from database:", tasks);

  return tasks.map((task) => {
    // Convert database tasks to frontend Task format
    // Use the status field to determine completion since is_completed might not be in the TypeScript types
    const isCompleted = task.status === "completed";
    
    console.log(`Task ${task.id} status: ${task.status}, final isCompleted: ${isCompleted}`);
    
    return createTask({
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
        id: String(isCompleted ? 2 : 1),
        name: isCompleted ? "Completed" : "In Progress",
        color: isCompleted ? "#10B981" : "#3B82F6",
      },
      priority: task.priority
        ? (task.priority.toUpperCase() as Priority)
        : "LOW",
      isCompleted: isCompleted,
      project: task.project?.name || "Uncategorized",
    })
  });
}
