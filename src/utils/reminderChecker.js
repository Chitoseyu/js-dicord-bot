import fs from "fs/promises";
import path from "path";

const REMINDERS_FILE = path.resolve("./reminders.json");

let isChecking = false; // 用來記錄是否已檢查

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

    // 按時間排序提醒任務
    reminders.sort((a, b) => new Date(a.time) - new Date(b.time));

    // 找到下一個需要執行的提醒
    const nextReminder = reminders.find(
      (reminder) => new Date(reminder.time) > now
    );

    if (!nextReminder) {
      console.log("✅ 無需提醒，所有任務已完成。");
      isChecking = false;
      return;
    }

    // 計算與最近提醒的時間差
    const reminderTime = new Date(nextReminder.time).getTime();
    const currentTime = now.getTime();
    const delay = Math.max(0, reminderTime - currentTime);

    console.log(
      `⏰ 下一次提醒將在 ${new Intl.DateTimeFormat("zh-TW", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Asia/Taipei",
      }).format(new Date(nextReminder.time))}，剩餘 ${Math.floor(
        delay / 1000
      )} 秒。`
    );

    // 設置下一次檢查
    setTimeout(async () => {
      // 發送提醒
      const channel = client.channels.cache.get(nextReminder.channelId);
      if (channel) {
        await channel.send({
          content: `<@${nextReminder.userId}> ${nextReminder.message}`,
        });
      }

      // 移除已完成的提醒
      reminders = reminders.filter(
        (reminder) =>
          !(
            reminder.userId === nextReminder.userId &&
            reminder.channelId === nextReminder.channelId &&
            reminder.time === nextReminder.time &&
            reminder.message === nextReminder.message
          )
      );

      // 更新檔案
      await fs.writeFile(REMINDERS_FILE, JSON.stringify(reminders, null, 2));

      isChecking = false; // 檢查完成後重置狀態
      // 再次檢查
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
    try {
      const data = await fs.readFile(REMINDERS_FILE, "utf-8");
      reminders = JSON.parse(data);
    } catch {
      // 檔案不存在，無提醒任務
    }

    reminders.push(reminder);
    await fs.writeFile(REMINDERS_FILE, JSON.stringify(reminders, null, 2));

    // console.log("✅ 新提醒已加入！");

    startReminderChecker(client); // 動態啟動檢查
  } catch (error) {
    console.error("❌ 無法新增提醒：", error);
  }
};
