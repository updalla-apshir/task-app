"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { registerUser } from "./register";

export const getTeam = async () => {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error(
        "Authentication required. Please sign in to view team data."
      );
    }

    const team = await prisma.team.findFirst({
      where: {
        members: {
          some: {
            userId: userId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        members: {
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
              },
            },
          },
        },
        projects: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
          },
        },
      },
    });

    if (!team) {
      return { members: [] }; // Return empty team instead of null
    }

    return team;
  } catch (error) {
    console.error("Team fetch error:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to load team data. Please try again later.");
  }
};

export const createTeam = async (formData: FormData) => {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error("Authentication required");
    }

    const name = formData.get("name") as string;
    if (!name?.trim()) {
      throw new Error("Team name is required");
    }

    const now = new Date();
    const team = await prisma.team.create({
      data: {
        name,
        createdAt: now,
        updatedAt: now,
        members: {
          create: {
            userId,
            role: "owner",
            createdAt: now,
            updatedAt: now,
          },
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        members: {
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
              },
            },
          },
        },
      },
    });

    revalidatePath("/team");
    return { success: true, team };
  } catch (error) {
    console.error("Create team error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create team",
    };
  }
};

export const addTeamMember = async (teamId: string, formData: FormData) => {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error("Authentication required");
    }

    // Check if the current user is a team owner
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        members: {
          some: {
            userId,
            role: "owner",
          },
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!team) {
      throw new Error("Not authorized to add members to this team");
    }

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!email?.trim()) {
      throw new Error("Email is required");
    }
    if (!password?.trim()) {
      throw new Error("Password is required");
    }
    if (password !== confirmPassword) {
      throw new Error("Passwords do not match");
    }

    // Find the user by email
    let userToAdd = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
      },
    });
    if (userToAdd) throw new Error("User is already Registered");

    if (!userToAdd) {
      // Register new user
      const result = await registerUser({
        email,
        password,
        confirmPassword,
      });

      if (!result.success) {
        let errorMessage = "Failed to create user";

        if (result.errors) {
          if ("general" in result.errors && result.errors.general?.length > 0) {
            errorMessage = result.errors.general[0];
          } else {
            const firstError = Object.values(result.errors)[0];
            if (firstError && firstError.length > 0) {
              errorMessage = firstError[0];
            }
          }
        }

        throw new Error(errorMessage);
      }

      if (!result.user) {
        throw new Error("Failed to create user account");
      }

      userToAdd = {
        id: result.user.id,
        email: result.user.email,
      };
    }

    // Check if user is already a member
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: userToAdd.id,
      },
    });

    if (existingMember) {
      throw new Error("User is already a member of this team");
    }

    const now = new Date();
    // Add the user to the team
    await prisma.teamMember.create({
      data: {
        teamId,
        userId: userToAdd.id,
        role: "member",
        createdAt: now,
        updatedAt: now,
      },
    });

    // Update user role to Team_Member if they're not already
    await prisma.user.update({
      where: { id: userToAdd.id },
      data: { role: "Team_Member" },
    });

    revalidatePath("/team");
    return { success: true };
  } catch (error) {
    console.error("Add team member error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to add team member",
    };
  }
};
