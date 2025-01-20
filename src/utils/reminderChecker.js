import fs from "fs/promises";
import path from "path";

const REMINDERS_FILE = path.resolve("./reminders.json");

let isChecking = false; // 用來記錄是否已檢查
let isWriting = false; // 加鎖機制，防止檔案競爭

// 防止檔案寫入競爭
const safeWriteFile = async (filePath, data) => {
  while (isWriting) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  isWriting = true;
  try {
    await fs.writeFile(filePath, data);
  } finally {
    isWriting = false;
  }
};

export const startReminderChecker = async (client) => {
  if (isChecking) return; // 防止重複啟動檢查
  isChecking = true;
  try {
    // 讀取提醒任務
    let reminders = [];
    const now = new Date();

    try {
      const data = await fs.readFile(REMINDERS_FILE, "utf-8");
      reminders = JSON.parse(data);
    } catch {
      // 無提醒任務
      isChecking = false;
      return;
    }

    // 找到下一個需要執行的提醒
    const nowTime = now.getTime();
    const remindersToExecute = reminders.filter(
      (reminder) => new Date(reminder.time).getTime() >= nowTime
    );

    if (remindersToExecute.length === 0) {
      //console.log("✅ 無需提醒，所有任務已完成。");
      isChecking = false;
      return;
    }

    // 計算與最近提醒的時間差
    const reminderTime = new Date(remindersToExecute[0].time).getTime();
    const delay = Math.max(0, reminderTime - nowTime);

    // console.log(
    //   `⏰ 下一次提醒將在 ${new Intl.DateTimeFormat("zh-TW", {
    //     year: "numeric",
    //     month: "2-digit",
    //     day: "2-digit",
    //     hour: "2-digit",
    //     minute: "2-digit",
    //     second: "2-digit",
    //     hour12: false,
    //     timeZone: "Asia/Taipei",
    //   }).format(new Date(remindersToExecute[0].time))}，剩餘 ${Math.floor(
    //     delay / 1000
    //   )} 秒。`
    // );

    setTimeout(async () => {
      // 發送所有到期的提醒
      for (const reminder of remindersToExecute) {
        const channel = client.channels.cache.get(reminder.channelId);
        if (channel) {
          await channel.send({
            content: `<@${reminder.userId}> ${reminder.message}`,
          });
        }
      }

      isChecking = false; // 檢查完成後重置狀態
      startReminderChecker(client);
    }, delay);
  } catch (error) {
    console.error("❌ 檢查提醒時出錯：", error);
    isChecking = false;
  }
};

export const addReminder = async (reminder, client) => {
  try {
    let reminders = [];
    const now = new Date();
    try {
      const data = await fs.readFile(REMINDERS_FILE, "utf-8");
      reminders = JSON.parse(data);
    } catch {
      // 檔案不存在
    }

    // 移除過期提醒
    reminders = reminders.filter((existingReminder) => {
      const reminderTime = new Date(existingReminder.time);
      return reminderTime > now; // 保留未過期的提醒
    });

    reminders.push(reminder);

    reminders.sort((a, b) => new Date(a.time) - new Date(b.time));

    await safeWriteFile(REMINDERS_FILE, JSON.stringify(reminders, null, 2));

    startReminderChecker(client);
  } catch (error) {
    console.error("❌ 無法新增提醒：", error);
  }
};
