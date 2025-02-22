import { Events, ActivityType } from "discord.js";

import { startReminderChecker } from "@/utils/reminderChecker";

export const event = {
  name: Events.ClientReady,
  once: true,
};

export const action = async (bot) => {
  const botname = bot.user.tag;

  console.log(`啟動完成! 已登入 ${botname}`);

  startReminderChecker(bot);

  bot.user.setPresence({
    status: "online", //idle
    activities: [{ name: `パニグレ`, type: ActivityType.PLAYING }],
  });

  // 記錄啟動時間
  const startTime = Date.now();

  setInterval(() => {
    const elapsed = Date.now() - startTime;
    const seconds = Math.floor((elapsed / 1000) % 60);
    const minutes = Math.floor((elapsed / 1000 / 60) % 60);
    const hours = Math.floor(elapsed / 1000 / 60 / 60);
    const days = Math.floor(elapsed / (1000 * 60 * 60 * 24));

    process.stdout.clearLine(0); // 清除當前行
    process.stdout.cursorTo(0); // 將游標移到行首
    process.stdout.write(
      `⏳ 運行時間: ${days} 天 ${hours} 小時 ${minutes} 分鐘 ${seconds} 秒`
    );
  }, 1000);

  try {
    const channel = bot.channels.cache.get(process.env.Webhook_channel_id);
    const webhooks = await channel.fetchWebhooks();
    const webhook = webhooks.find(
      (wh) => wh.token === process.env.Webhook_token
    );

    if (!webhook) {
      return console.log("No webhook was found that I can use!");
    }

    const messageContent = botname + ` 上線囉！`;

    await webhook.send({
      content: messageContent,
      username: "DEV_Elf",
      avatarURL: "https://i.imgur.com/8qv0geN.png",
    });
  } catch (error) {
    console.error("Webhook message 發送失敗: ", error);
  }
};
