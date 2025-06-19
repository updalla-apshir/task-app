"use server";

import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendUpcomingTaskReminders() {
  try {
    const upcomingTasks = await prisma.task.findMany({
      where: {
        due_date: {
          lte: new Date(Date.now() + 60 * 60 * 1000), // due within 1 hour
          gte: new Date(), // not overdue
        },
        is_completed: false,
        is_archived: false,
        reminderSent: false,
      },
      include: {
        createdBy: true,
      },
    });

    for (const task of upcomingTasks) {
      const userEmail = task.createdBy?.email;
      const userId = task.createdBy?.id;
      if (!userEmail || !userId) continue;

      // Create notification in database
      await prisma.notification.create({
        data: {
          title: `Task Reminder: ${task.title}`,
          message: `Your task "${task.title}" is due soon at ${new Date(task.due_date!).toLocaleString()}`,
          userId: userId,
          taskId: task.id,
        },
      });

      await transporter.sendMail({
        from: '"Task Manager" <your.email@gmail.com>',
        to: userEmail,
        subject: `Reminder: "${task.title}" is due soon`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>⏰ Task Due Soon</h2>
            <p><strong>${task.title}</strong> is due at: ${new Date(task.due_date!).toLocaleString()}</p>
            <p>Stay on top of your productivity! ✅</p>
          </div>
        `,
      });

      await prisma.task.update({
        where: { id: task.id },
        data: { reminderSent: true },
      });
    }

    console.log("✅ Task reminders sent successfully");
  } catch (error) {
    console.error("❌ Error sending task reminders:", error);
  }
}

// Function to get user notifications
export async function getUserNotifications(userId: string) {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            due_date: true,
          },
        },
      },
    });

    return notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

// Function to mark a notification as read
export async function markNotificationAsRead(notificationId: string) {
  try {
    await prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        read: true,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false, error };
  }
}

// Function to mark all notifications as read
export async function markAllNotificationsAsRead(userId: string) {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: userId,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return { success: false, error };
  }
}
