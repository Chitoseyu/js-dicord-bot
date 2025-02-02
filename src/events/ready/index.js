import { Events, ActivityType } from "discord.js";

import { startReminderChecker } from "@/utils/reminderChecker";

export const event = {
  name: Events.ClientReady,
  once: true,
};

export const action = async (bot) => {
  console.log(`啟動完成! 已登入 ${bot.user.tag}`);

  startReminderChecker(bot);

  bot.user.setPresence({
    status: "online", //idle
    activities: [{ name: `パニグレ`, type: ActivityType.PLAYING }],
  });

  try {
    const channel = bot.channels.cache.get(process.env.Webhook_channel_id);
    const webhooks = await channel.fetchWebhooks();
    const webhook = webhooks.find(
      (wh) => wh.token === process.env.Webhook_token
    );

    if (!webhook) {
      return console.log("No webhook was found that I can use!");
    }

    const messageContent = `Liv Developer 上線囉！`;

    await webhook.send({
      content: messageContent,
      username: "DEV_Elf",
      avatarURL: "https://i.imgur.com/8qv0geN.png",
    });
  } catch (error) {
    console.error("Webhook message 發送失敗: ", error);
  }
};
