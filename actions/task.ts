"use server";

import { prisma } from "@/lib/prisma";
import { taskSchema } from "@/schemas/shema";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { TaskStatus } from "@prisma/client";

export async function getTasksForUser(userId?: string) {
  if (!userId) return [];

  const assignments = await prisma.projectAssignment.findMany({
    where: { userId },
    select: { projectId: true },
  });

  const assignedProjectIds = assignments.map((a) => a.projectId);

  // Get tasks created by user or in assigned projects, and include project name
  const tasks = await prisma.task.findMany({
    where: {
      OR: [{ created_by: userId }, { project_id: { in: assignedProjectIds } }],
    },
    include: {
      project: {
        select: { name: true, id: true },
      },
    },
  });

  return tasks;
}

export async function updateTaskCompletionStatus(
  taskId: string,
  isCompleted: boolean
) {
  console.log(
    `Attempting to update task ${taskId} to isCompleted=${isCompleted}`
  );

  if (!taskId) {
    console.error("Task ID is missing");
    return { success: false, error: "Task ID is required" };
  }

  try {
    // First fetch the task to see current state
    const currentTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!currentTask) {
      console.error(`Task ${taskId} not found`);
      return { success: false, error: "Task not found" };
    }

    console.log("Current task state:", currentTask);

    // Create the update data
    const updateData = {
      status: isCompleted ? TaskStatus.completed : TaskStatus.pending,
    };

    console.log("Updating task with data:", updateData);

    // Use update to ensure the task is updated regardless of current state
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
    });

    console.log("Task updated successfully:", updatedTask);

    // Force revalidation of tasks path to ensure UI is updated
    revalidatePath("/tasks");

    return { success: true, task: updatedTask };
  } catch (error) {
    console.error("Failed to update task:", error);
    return {
      success: false,
      error:
        "Failed to update task: " +
        (error instanceof Error ? error.message : String(error)),
    };
  }
}

export async function updateTask(taskId: string, formData: any) {
  if (!taskId) return { success: false, error: "Task ID is required" };

  const parseResult = taskSchema.safeParse(formData);

  if (!parseResult.success) {
    console.error("Validation error:", parseResult.error);
    return { success: false, error: parseResult.error.flatten() };
  }

  try {
    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: formData.title,
        description: formData.description || "",
        status: formData.status,
        priority: formData.priority,
        start_date: formData.startDate,
        due_date: formData.endDate,
        project_id: formData.projectId,
      },
    });

    revalidatePath("/tasks");
    return { success: true, task };
  } catch (error) {
    console.error("Failed to update task:", error);
    return { success: false, error: "Failed to update task" };
  }
}

export async function createTask(formData: z.infer<typeof taskSchema>) {
  const parseResult = taskSchema.safeParse(formData);

  if (!parseResult.success) {
    console.error("Validation error:", parseResult.error);
    return { success: false, error: parseResult.error.flatten() };
  }

  try {
    const task = await prisma.task.create({
      data: {
        title: formData.title,
        description: formData.description || "",
        status: formData.status,
        priority: formData.priority,
        start_date: formData.startDate,
        due_date: formData.endDate,
        created_at: formData.createdAt,
        project_id: formData.projectId,
        created_by: formData.createdBy as string,
      },
    });

    return { success: true, task };
  } catch (error) {
    console.error("Failed to create task:", error);
    return { success: false, error: "Failed to create task" };
  }
}

export const deleteTask = async (taskId: string) => {
  try {
    if (!taskId) {
      throw new Error("Task ID is required");
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    revalidatePath("/tasks");
    return { success: true, message: "Task deleted successfully." };
  } catch (error) {
    console.error("Failed to delete task:", error);
    throw new Error("Failed to delete task");
  }
};
