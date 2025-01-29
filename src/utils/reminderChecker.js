import fs from "fs/promises";
import path from "path";

const REMINDERS_FILE = path.resolve("./reminders.json");

let isChecking = false; // 用來記錄是否已檢查
let isWriting = false; // 加鎖機制，防止檔案競爭
let currentTimeout = null; // 儲存當前的 setTimeout
let nextReminderTime = null; // 記錄目前設置的最近提醒時間

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
// 取得最新的 ID
const getNextId = async () => {
  try {
    const data = await fs.readFile(REMINDERS_FILE, "utf-8");
    const reminders = JSON.parse(data);
    const lastId =
      reminders.length > 0 ? Math.max(...reminders.map((r) => r.id)) : 0;
    return lastId + 1;
  } catch {
    return 1;
  }
};
export const startReminderChecker = async (client) => {
  if (isChecking) return;
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

    reminders = reminders.filter(
      (reminder) => new Date(reminder.time).getTime() > now.getTime()
    );
    reminders.sort((a, b) => new Date(a.time) - new Date(b.time));

    if (reminders.length === 0) {
      // 沒有未來提醒
      nextReminderTime = null;
      clearTimeout(currentTimeout);
      currentTimeout = null;
      isChecking = false;
      return;
    }

    // 找到最近的提醒
    const closestReminderTime = new Date(reminders[0].time).getTime();

    if (nextReminderTime === null || closestReminderTime !== nextReminderTime) {
      // 更新最近提醒時間
      nextReminderTime = closestReminderTime;

      if (currentTimeout) {
        clearTimeout(currentTimeout);
        currentTimeout = null;
      }

      // 計算延遲時間
      const delay = Math.max(0, closestReminderTime - now.getTime());

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
      //   }).format(new Date(closestReminderTime))}，剩餘 ${Math.floor(
      //     delay / 1000
      //   )} 秒。`
      // );

      // 設置新的計時器
      currentTimeout = setTimeout(async () => {
        const data = await fs.readFile(REMINDERS_FILE, "utf-8");
        let reminders = JSON.parse(data);

        // 發送所有到期提醒
        const currentTime = new Date().getTime();
        const dueReminders = reminders.filter(
          (reminder) => new Date(reminder.time).getTime() <= currentTime
        );

        for (const reminder of dueReminders) {
          const channel = client.channels.cache.get(reminder.channelId);
          if (channel) {
            await channel.send({
              content: `<@${reminder.userId}> ${reminder.message}`,
            });
          }
        }
        // 移除已執行的提醒
        reminders = reminders.filter(
          (reminder) =>
            !dueReminders.some((executed) => reminder.id === executed.id)
        );
        // 更新檔案
        await safeWriteFile(REMINDERS_FILE, JSON.stringify(reminders, null, 2));
        isChecking = false;
        startReminderChecker(client); // 繼續檢查下一個提醒
      }, delay);
    } else {
      // console.log("沒有更新提醒時間");
      isChecking = false;
    }
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

    // 清理過期提醒
    reminders = reminders.filter(
      (existingReminder) =>
        new Date(existingReminder.time).getTime() > now.getTime()
    );
    reminder.id = await getNextId();
    reminder.createdAt = new Date().toISOString();

    reminders.push(reminder);
    reminders.sort((a, b) => new Date(a.time) - new Date(b.time));

    await safeWriteFile(REMINDERS_FILE, JSON.stringify(reminders, null, 2));

    isChecking = false;
    startReminderChecker(client);
  } catch (error) {
    console.error("❌ 無法新增提醒：", error);
  }
};
