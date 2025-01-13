import { Events } from "discord.js";

export const event = {
  name: Events.GuildMemberAdd,
  once: false,
};

export const action = async (member) => {
  console.log(`${member.user.tag} 加入了群組 ${member.guild.name}`);

  const defaultChannel = member.guild.systemChannel;

  if (!defaultChannel) {
    console.log("找不到伺服器的預設頻道，無法發送訊息。");
    return;
  }

  const welcomeMessage = `🎉 歡迎新成員 <@${member.id}> 加入！`;

  try {
    // 發送歡迎訊息到預設頻道
    await defaultChannel.send(welcomeMessage);
    console.log(`🎉 ${member.user.tag} 已加入 ${member.guild.name}`);
  } catch (error) {
    console.error("發送歡迎訊息時發生錯誤：", error);
  }
};
