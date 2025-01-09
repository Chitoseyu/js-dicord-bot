import { Events, Client, GatewayIntentBits, ActivityType } from "discord.js";

export const event = {
  name: Events.ClientReady,
  once: true,
};

export const action = (bot) => {
  console.log(`啟動完成! 已登入 ${bot.user.tag}`);

  bot.user.setPresence({
    status: "online", //idle
    activities: [{ name: `パニグレ`, type: ActivityType.PLAYING }],
  });
};
