'use server';

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export interface TeamMember {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  createdAt: Date;
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Only premium users can fetch team members
  if (session.user.role !== Role.Premium) {
    throw new Error("Forbidden: Premium users only");
  }

  try {
    const teamMembers = await prisma.user.findMany({
      where: {
        OR: [
          { id: session.user.id }, // Include the current user
          { role: Role.Team_Member }, // Include team members
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    });

    return teamMembers;
  } catch (error) {
    console.error("Error fetching team members:", error);
    throw new Error("Failed to fetch team members");
  }
}

export async function addTeamMember(email: string): Promise<TeamMember> {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (session.user.role !== Role.Premium) {
    throw new Error("Forbidden: Premium users only");
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // If user exists, update their role to Team_Member
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: { role: Role.Team_Member },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true,
        },
      });
      return updatedUser;
    }

    // If user doesn't exist, create a new user with Team_Member role
    const newUser = await prisma.user.create({
      data: {
        email,
        role: Role.Team_Member,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    });

    return newUser;
  } catch (error) {
    console.error("Error adding team member:", error);
    throw new Error("Failed to add team member");
  }
}

export async function removeTeamMember(memberId: string): Promise<void> {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (session.user.role !== Role.Premium) {
    throw new Error("Forbidden: Premium users only");
  }

  try {
    // Check if the member exists and is a team member
    const member = await prisma.user.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new Error("Team member not found");
    }

    if (member.role !== Role.Team_Member) {
      throw new Error("Can only remove team members");
    }

    // Update user role back to regular user
    await prisma.user.update({
      where: { id: memberId },
      data: { role: Role.User },
    });
  } catch (error) {
    console.error("Error removing team member:", error);
    throw new Error("Failed to remove team member");
  }
} 