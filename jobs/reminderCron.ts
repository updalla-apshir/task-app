import { sendUpcomingTaskReminders } from '../actions/reminder&notif';
import * as nodeCron from 'node-cron';

let reminderJob: nodeCron.ScheduledTask | null = null;

/**
 * Starts the cron job for checking and sending task reminders
 */
export function startReminderCron() {
  console.log("Starting reminder cron job...");

  // Run every 15 minutes
  reminderJob = nodeCron.schedule('*/15 * * * *', async function() {
    console.log(`Running scheduled task reminder check at: ${new Date().toISOString()}`);
    try {
      await sendUpcomingTaskReminders();
      console.log("Reminder check completed: { success: true }");
    } catch (error) {
      console.error("❌ Error processing task reminders:", error);
      console.log("Reminder check completed: { success: false, error }");
    }
  });

  console.log("Reminder cron job started successfully");
  
  return reminderJob;
}

/**
 * Stops the cron job if it's running
 */
export function stopReminderCron() {
  if (reminderJob) {
    reminderJob.stop();
    console.log("Reminder cron job stopped");
  }
} 