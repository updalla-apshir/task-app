import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/types/user";

interface TeamMemberWithUser {
  id: string;
  ownerId: string;
  userId: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || user.role !== "Premium") {
      return NextResponse.json(
        { success: false, message: "Premium feature only" },
        { status: 403 }
      );
    }

    const teamMembers = await prisma.teamMember.findMany({
      where: { ownerId: session.user.id },
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

    const formattedMembers = teamMembers.map((member: TeamMemberWithUser) => ({
      id: member.id,
      name: member.user.name,
      email: member.user.email,
      image: member.user.image,
      createdAt: member.createdAt,
    }));

    return NextResponse.json({
      success: true,
      members: formattedMembers,
    });
  } catch (error) {
    console.error("Failed to fetch team members:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || user.role !== "Premium") {
      return NextResponse.json(
        { success: false, message: "Premium feature only" },
        { status: 403 }
      );
    }

    const { email } = await request.json();
    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // Find or create the user
    const memberUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!memberUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Check if the user is already a team member
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        ownerId_userId: {
          ownerId: session.user.id,
          userId: memberUser.id,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { success: false, message: "User is already a team member" },
        { status: 400 }
      );
    }

    // Create team member
    const teamMember = await prisma.teamMember.create({
      data: {
        ownerId: session.user.id,
        userId: memberUser.id,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      member: {
        id: teamMember.id,
        name: teamMember.user.name,
        email: teamMember.user.email,
        image: teamMember.user.image,
        createdAt: teamMember.createdAt,
      },
    });
  } catch (error) {
    console.error("Failed to add team member:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
} 