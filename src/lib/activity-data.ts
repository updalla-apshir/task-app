"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export type ActivityItem = {
  id: string;
  userId: string;
  userName: string;
  userImage?: string | null;
  action: string;
  targetId: string;
  targetName: string;
  projectId?: string;
  projectName?: string;
  comment?: string;
  timestamp: Date;
  type: "task" | "comment" | "update" | "project";
  userRole?: string;
};

// Function to fetch activity feed data for the current user
export async function getActivityFeed(limit = 10) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    
    if (!userId) return [];
    
    // Get projects the user is assigned to
    const assignments = await prisma.projectAssignment.findMany({
      where: { userId },
      select: { projectId: true },
    });
    
    const projectIds = assignments.map(a => a.projectId);
    
    // Get recent tasks for these projects
    const recentTasks = await prisma.task.findMany({
      where: {
        OR: [
          { created_by: userId },
          { project_id: { in: projectIds } }
        ]
      },
      orderBy: {
        updated_at: 'desc'
      },
      take: limit,
      include: {
        project: true,
      }
    });

    // Get all project assignments for the projects with tasks
    const taskProjectIds = [...new Set(recentTasks.map(task => task.project_id).filter(Boolean))];
    
    const projectAssignments = await prisma.projectAssignment.findMany({
      where: {
        projectId: { in: taskProjectIds as string[] }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    // Transform tasks into activity items
    const activities: ActivityItem[] = await Promise.all(recentTasks.map(async task => {
      let action = "updated";
      if (task.created_at.getTime() === task.updated_at.getTime()) {
        action = "created";
      } else if (task.status === "completed") {
        action = "completed";
      }
      
      // Find project team members for this task
      const teamMembers = projectAssignments.filter(
        pa => pa.projectId === task.project_id
      );
      
      // Pick one team member (preferably with Team_Member role) to attribute the action to
      // Or fall back to the task creator or current user
      const teamMember = teamMembers.find(tm => tm.user.role === "Team_Member") || 
                          teamMembers[0];
      
      // If no team member found, fall back to task creator
      let displayUserId = task.created_by;
      let displayUserName = "Unknown User";
      let displayUserImage = null;
      let userRole = "User";
      
      if (teamMember) {
        displayUserId = teamMember.user.id;
        displayUserName = teamMember.user.name || "Team Member";
        displayUserImage = teamMember.user.image;
        userRole = teamMember.user.role || "User";
      } else if (task.created_by) {
        // Get the user who created the task
        const taskCreator = await prisma.user.findUnique({
          where: { id: task.created_by },
          select: { id: true, name: true, image: true, role: true }
        });
        
        if (taskCreator) {
          displayUserId = taskCreator.id;
          displayUserName = taskCreator.name || "Unknown User";
          displayUserImage = taskCreator.image;
          userRole = taskCreator.role || "User";
        }
      }
      
      return {
        id: `task-${task.id}`,
        userId: displayUserId || userId,
        userName: displayUserName,
        userImage: displayUserImage,
        userRole: userRole,
        action,
        targetId: task.id,
        targetName: task.title,
        projectId: task.project?.id,
        projectName: task.project?.name,
        timestamp: task.updated_at,
        type: "task"
      };
    }));
    
    // For a real app, you might also fetch comments, project updates, etc.
    // and merge them into the activities array, then sort by timestamp
    
    return activities.sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
    
  } catch (error) {
    console.error("Error fetching activity feed:", error);
    return [];
  }
} 