import { Events } from "discord.js";
import { useAppStore } from "@/store/app";

export const event = {
  name: Events.MessageCreate,
  once: false,
};

export const action = async (message) => {
  // 忽略機器人發送的訊息
  if (message.author.bot) return;

  const appStore = useAppStore();

  const guildReplies = appStore.replies.get(message.guild.id);
  if (!guildReplies) return;

  const userMessage = message.content.toLowerCase();

  if (guildReplies.has(userMessage)) {
    const response = guildReplies.get(userMessage);
    await message.channel.send(response);
  }
};
