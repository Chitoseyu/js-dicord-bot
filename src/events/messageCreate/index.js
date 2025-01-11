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
  const replies = appStore.replies;

  const userMessage = message.content.toLowerCase();

  if (replies.has(userMessage)) {
    const response = replies.get(userMessage);
    await message.channel.send(response);
  }
};
