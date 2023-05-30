import { Events, Client, GatewayIntentBits, ActivityType } from "discord.js";

export const event = {
  name: Events.ClientReady,
  once: true,
};

export const action = (bot) => {
  console.log(`準備完成! 已登入 ${bot.user.tag}`);

  bot.user.setPresence({
    status: "online", //idle
    activities: [{ name: `Blow out`, type: ActivityType.Listening }],
    // ActivityTypes List
    // "PLAYING"	  ActivityType.Playing   0
    // "STREAMING"	ActivityType.Streaming 1
    // "LISTENING"	ActivityType.Listening 2
    // "WATCHING"	  ActivityType.Watching  3
    // "CUSTOM"	    ActivityType.Custom    4
    // "COMPETING"	ActivityType.Competing 5
  });
};
