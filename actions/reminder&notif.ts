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
      if (!userEmail) continue;

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
