let isChecking = false; // 用來記錄是否已檢查
let currentTimeout = null; // 儲存當前的 setTimeout
let nextReminderTime = null; // 記錄目前設置的最近提醒時間

export const formatReminderTime = (timeData) => {
  let format_time = "";
  try {
    format_time = `${new Date(timeData).getFullYear()}/${
      new Date(timeData).getMonth() + 1
    }/${new Date(timeData).getDate()} ${
      new Date(timeData).getHours() >= 12 ? "下午" : "上午"
    } ${new Date(timeData).getHours() % 12 || 12}:${String(
      new Date(timeData).getMinutes()
    ).padStart(2, "0")}`;
  } catch (error) {
    console.error("❌ 無法格式化時間：", error);
  }
  return format_time;
};
export const startReminderChecker = async (client) => {
  if (isChecking) return;
  isChecking = true;
  try {
    // 讀取提醒任務
    let reminders = [];
    const now = new Date();
    const data = await global.db
      .prepare("SELECT * FROM reminders WHERE time > ? ORDER BY time ASC")
      .all(now.toISOString());
    reminders = data;

    reminders = reminders.filter(
      (reminder) => new Date(reminder.time).getTime() > now.getTime()
    );
    reminders.sort((a, b) => new Date(a.time) - new Date(b.time));

    if (reminders.length === 0) {
      // console.log("沒有未來提醒");
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
        const data = await global.db.prepare("SELECT * FROM reminders").all();
        let reminders = data;

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
        const dueReminderIds = dueReminders.map((reminder) => reminder.id);
        if (dueReminderIds.length > 0) {
          const placeholders = dueReminderIds.map(() => "?").join(", ");
          await global.db
            .prepare(`DELETE FROM reminders WHERE id IN (${placeholders})`)
            .run(...dueReminderIds);
        }
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
    const db = global.db;
    reminder.createdAt = new Date().toISOString();

    await db
      .prepare(
        "INSERT INTO reminders (userId, channelId, time, message, createdAt) VALUES (?, ?, ?, ?, ?)"
      )
      .run(
        reminder.userId,
        reminder.channelId,
        reminder.time,
        reminder.message,
        reminder.createdAt
      );

    isChecking = false;
    startReminderChecker(client);
  } catch (error) {
    console.error("❌ 無法新增提醒任務：", error);
  }
};
export const deleteReminder = async (reminderId, client) => {
  try {
    const db = global.db;
    const deletedReminder = await db
      .prepare("SELECT * FROM reminders WHERE id = ?")
      .get(reminderId);

    if (!deletedReminder) {
      return [];
    }
    await db.prepare("DELETE FROM reminders WHERE id = ?").run(reminderId);

    isChecking = false;
    startReminderChecker(client); // 繼續檢查下一個提醒

    return deletedReminder;
  } catch (error) {
    console.error("❌ 無法刪除提醒任務：", error);
  }
};
export const getReminder = async () => {
  let reminders = [];
  try {
    const db = global.db;
    const data = await db.prepare("SELECT * FROM reminders").all();
    reminders = data;
    return reminders;
  } catch (error) {
    console.error("❌ 無法取得提醒任務：", error);
  }
};
