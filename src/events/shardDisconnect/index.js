import { Events } from "discord.js";

export const event = {
  name: Events.ShardDisconnect,
  once: true,
};

export const action = async (bot) => {
  try {
    const channel = bot.channels.cache.get(process.env.Webhook_channel_id);
    const webhooks = await channel.fetchWebhooks();
    const webhook = webhooks.find(
      (wh) => wh.token === process.env.Webhook_token
    );

    if (!webhook) {
      return console.log("No webhook was found that I can use!");
    }

    const messageContent = `Liv Helper 下線囉！`;

    await webhook.send({
      content: messageContent,
      username: "Bot_Elf",
      avatarURL: "https://i.imgur.com/LzEh5UO.png",
    });
  } catch (error) {
    console.error("Webhook message 發送失敗: ", error);
  }
};
