import { Events, EmbedBuilder, WebhookClient } from "discord.js";
import dotenv from "dotenv";

export const event = {
  name: Events.ClientReady,
  once: true,
};

export const action = async (bot) => {
  const channel = bot.channels.cache.get(process.env.Webhook_channel_id);
  try {
    const webhooks = await channel.fetchWebhooks();
    const webhook = webhooks.find((wh) => process.env.Webhook_token);

    if (!webhook) {
      return console.log("No webhook was found that I can use!");
    }
    await webhook.send({
      content: "JS Bot 上線囉",
      username: "Bot_Elf",
      avatarURL: "https://i.imgur.com/YXbYWnh.png",
    });
  } catch (error) {
    console.error("Error trying to send a message: ", error);
  }
};
