"use server";

import { projectSchema } from "@/schemas/shema";
import { prisma } from "@/lib/prisma";
import z from "zod";
import { auth } from "@/lib/auth";
import { TaskPriority, ProjectStatus } from "@prisma/client";

export const createProject = async (
  formData: z.infer<typeof projectSchema>
) => {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) return { success: false, error: "User not authenticated" };

    const parseResult = projectSchema.safeParse(formData);

    if (!parseResult.success) {
      console.error("Validation error:", parseResult.error);
      return { success: false, error: parseResult.error.flatten() };
    }

    if (!formData.name)
      return { success: false, error: "Project name is required" };

    const validAssignedTo = formData.assignedTo.filter((id) => id);
    if (validAssignedTo.length === 0) {
      return {
        success: false,
        error: "At least one assigned user is required",
      };
    }

    try {
      const project = await prisma.project.create({
        data: {
          name: formData.name,
          description: formData.description || "",
          start_date: formData.startDate,
          due_date: formData.endDate,
          status: formData.status,
          priority: formData.priority,
          ownerId: userId,
        },
      });

      // Create ProjectAssignments after project is created
      await prisma.projectAssignment.createMany({
        data: validAssignedTo.map((assignedUserId) => ({
          userId: assignedUserId,
          projectId: project.id,
        })),
      });

      // Return success with the project data
      return {
        success: true,
        data: {
          ...project,
          assignedTo: validAssignedTo.map((userId) => ({
            userId,
            projectId: project.id,
            user: {
              id: userId,
              name: session?.user?.name || "",
              email: session?.user?.email || "",
              image: session?.user?.image || null,
            },
          })),
        },
      };
    } catch (dbError) {
      console.error("Database error:", dbError);
      return { success: false, error: "Failed to create project in database" };
    }
  } catch (error) {
    console.error("Project creation failed:", error);
    return { success: false, error: String(error) };
  }
};

export const getProjects = async () => {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) return [];

    const assignedProjectIds = await getProjectIdsForUser(userId);

    const projects = await prisma.project.findMany({
      where: {
        OR: [{ ownerId: userId }, { id: { in: assignedProjectIds } }],
      },
      include: {
        assignedTo: {
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
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!projects || projects.length === 0) {
      console.log("No projects found");
      return [];
    }

    // Step 2: Map to normalized return format
    return projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description || "",
      status: project.status,
      priority: project.priority,
      start_date: project.start_date,
      due_date: project.due_date,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      ownerId: project.ownerId,
      owner: project.owner,
      assignedTo: project.assignedTo,
    }));
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
};

async function getProjectIdsForUser(userId: string): Promise<string[]> {
  try {
    const assignments = await prisma.projectAssignment.findMany({
      where: {
        userId: userId,
      },
      select: {
        projectId: true,
      },
    });
    return assignments.map((a) => a.projectId);
  } catch (error) {
    console.error("Error getting project assignments:", error);
    return [];
  }
}
