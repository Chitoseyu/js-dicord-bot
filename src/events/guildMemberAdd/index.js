import { Events } from "discord.js";
import { getServerSettings } from "@/utils/serverSetting";
export const event = {
  name: Events.GuildMemberAdd,
  once: false,
};

export const action = async (member) => {
  console.log(`${member.user.tag} 加入了群組 ${member.guild.name}`);

  const settings = getServerSettings(member.guild.id);
  if (!settings || !settings.enabled) return;

  const defaultChannel = member.guild.systemChannel;

  if (!defaultChannel) {
    console.log("找不到伺服器的預設頻道，無法發送訊息。");
    return;
  }

  const welcomeMessage = settings.joinMessage.replace(
    "{user}",
    `<@${member.id}>`
  );

  try {
    // 發送歡迎訊息到預設頻道
    await defaultChannel.send(welcomeMessage);
    console.log(`🎉 ${member.user.tag} 已加入 ${member.guild.name}`);
  } catch (error) {
    console.error("發送歡迎訊息時發生錯誤：", error);
  }
};
