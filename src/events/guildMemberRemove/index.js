import { Events } from "discord.js";

export const event = {
  name: Events.GuildMemberRemove,
  once: false,
};

export const action = async (member) => {
  console.log(`${member.user.tag} 離開了群組 ${member.guild.name}`);

  const defaultChannel = member.guild.systemChannel;

  if (!defaultChannel) {
    console.log("找不到伺服器的預設頻道，無法發送訊息。");
    return;
  }

  const nickname = member.displayName;

  const leaveMessage = `👋 成員 **${nickname}** 離開了 我們懷念他 😢`;

  try {
    await defaultChannel.send(leaveMessage);
    console.log(`❌ 成員 ${nickname} 已離開 ${member.guild.name}`);
  } catch (error) {
    console.error("發送離開訊息時發生錯誤：", error);
  }
};
