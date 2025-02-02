import { Events } from "discord.js";
import { getServerSettings } from "@/utils/serverSetting";
export const event = {
  name: Events.GuildMemberRemove,
  once: false,
};

export const action = async (member) => {
  console.log(`${member.user.tag} 離開了群組 ${member.guild.name}`);

  const settings = getServerSettings(member.guild.id);
  if (!settings || !settings.enabled) return;

  const defaultChannel = member.guild.systemChannel;

  if (!defaultChannel) {
    console.log("找不到伺服器的預設頻道，無法發送訊息。");
    return;
  }

  // 檢查 Bot 是否擁有必要權限，被踢出不發送任何訊息
  const botPermissions = defaultChannel.permissionsFor(member.guild.members.me);
  if (
    !botPermissions?.has("SendMessages") ||
    !botPermissions.has("ViewChannel")
  ) {
    //console.error("Bot 缺少發送訊息或查看頻道的權限！");
    return;
  }

  const nickname = member.displayName;

  const leaveMessage = settings.leaveMessage.replace(
    "{user}",
    `**${nickname}**`
  );

  try {
    await defaultChannel.send(leaveMessage);
    console.log(`❌ 成員 ${nickname} 已離開 ${member.guild.name}`);
  } catch (error) {
    console.error("發送離開訊息時發生錯誤：", error);
  }
};
