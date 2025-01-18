import fs from "fs/promises";
import path from "path";

const REMINDERS_FILE = path.resolve("./reminders.json");

let reminders = [];

const checkReminders = async (client) => {
  try {
    const data = await fs.readFile(REMINDERS_FILE, "utf-8");
    const reminders = JSON.parse(data);
    const now = new Date();

    const remainingReminders = [];

    for (const reminder of reminders) {
      const reminderTime = new Date(reminder.time);

      if (reminderTime <= now) {
        // 發送提醒訊息
        const channel = await client.channels.fetch(reminder.channelId);
        if (channel) {
          await channel.send({
            content: `<@${reminder.userId}> ${reminder.message}`,
          });
        }
      } else {
        // 未到期的提醒保留
        remainingReminders.push(reminder);
      }
    }

    // 更新 reminders.json
    await fs.writeFile(
      REMINDERS_FILE,
      JSON.stringify(remainingReminders, null, 2)
    );
  } catch (error) {
    console.error("❌ 檢查提醒時出錯：", error);
  }
};

export const startReminderChecker = (client) => {
  setInterval(() => checkReminders(client), 60 * 1000); // 每分鐘檢查一次
};
