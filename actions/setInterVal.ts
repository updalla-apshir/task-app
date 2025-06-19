import { sendUpcomingTaskReminders } from "./reminder&notif";

setInterval(
  async () => {
    console.log("Checking for upcoming tasks...");
    await sendUpcomingTaskReminders();
  },
  1000 * 60 * 5
); // every 5 minutes
