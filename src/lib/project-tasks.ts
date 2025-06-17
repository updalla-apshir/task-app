"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Role } from "@/types/user";

// Function to get all tasks for a specific project
export async function getTasksForProject(projectId: string) {
  try {
    if (!projectId) return [];

    const tasks = await prisma.task.findMany({
      where: {
        project_id: projectId,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return tasks;
  } catch (error) {
    console.error("Error fetching tasks for project:", error);
    return [];
  }
}

// Function to get all tasks for all projects accessible to the current user
export async function getAllTasksForUser() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) return [];

    // Get projects the user is assigned to
    const assignments = await prisma.projectAssignment.findMany({
      where: { userId },
      select: { projectId: true },
    });

    const projectIds = assignments.map((a) => a.projectId);

    // Get all tasks for these projects
    const tasks = await prisma.task.findMany({
      where: {
        OR: [{ created_by: userId }, { project_id: { in: projectIds } }],
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return tasks;
  } catch (error) {
    console.error("Error fetching all tasks:", error);
    return [];
  }
}

// Check if user is premium
export async function checkUserPremium() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) return false;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
      },
    });

    // Check if user has Premium role
    const isPremium = user?.role === Role.Premium;

    return isPremium;
  } catch (error) {
    console.error("Error checking premium status:", error);
    return false;
  }
}

// Get team members for a project
export async function getTeamMembersForProject(projectId: string) {
  try {
    if (!projectId) return [];

    const assignments = await prisma.projectAssignment.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return assignments.map((assignment) => assignment.user);
  } catch (error) {
    console.error("Error fetching team members:", error);
    return [];
  }
}
