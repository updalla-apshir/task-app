"use server";

import { prisma } from "@/lib/prisma";

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
        select: { name: true },
      },
    },
  });

  return tasks;
}
