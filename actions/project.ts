"use server";

import { projectSchema } from "@/schemas/shema";
import { prisma } from "@/lib/prisma";
import z from "zod";
import { auth } from "@/lib/auth";

export const createProject = async (
  formData: z.infer<typeof projectSchema>
) => {
  console.log("Received form data:", formData);
  const validation = projectSchema.safeParse(formData);

  if (!validation.success) {
    console.error("Validation failed:", validation.error.errors);
    return { success: false, error: validation.error.errors };
  }

  try {
    const project = await prisma.project.create({
      data: {
        name: validation.data.name,
        description: validation.data.description,
        start_date: validation.data.start_date,
        due_date: validation.data.due_date,
        status: validation.data.status,
        ownerId: validation.data.ownerId,
        teamId: validation.data.teamId,
      },
      include: {
        owner: true,
        team: true,
        tasks: true,
      },
    });

    console.log("Project created:", project);
    return { success: true, data: project };
  } catch (error) {
    console.error("Project creation failed:", error);
    return { success: false, error: String(error) };
  }
};

export const getProjects = async () => {
  const session = await auth();
  const userId = session?.user.id;
  const data = await prisma.project.findMany({
    where: {
      ownerId: userId,
    },
  });
  return data;
};
