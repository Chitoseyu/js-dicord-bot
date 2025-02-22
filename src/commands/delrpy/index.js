import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  MessageFlags,
} from "discord.js";
import { useAppStore } from "@/store/app";
import { logAction } from "@/utils/logHelper";
import RepliesManager from "@/utils/serverSetting.js";

export const command = new SlashCommandBuilder()
  .setName("delrpy")
  .setDescription("刪除關鍵字的自訂回應")
  .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
  .setDMPermission(false)
  .addStringOption((option) =>
    option.setName("id").setDescription("關鍵字的ID").setRequired(true)
  );

export const action = async (ctx) => {
  // 記錄使用者訊息到日誌檔案
  const guildName = ctx.guild.name; // 群組名稱
  const userName = ctx.member?.displayName || ctx.user.username; // 用戶名稱
  const nickname = ctx.member.nickname || "無"; // 群組暱稱
  const guildId = ctx.guild.id; // 群組 ID
  const userId = ctx.user.id; // 用戶 ID
  let logMessage = "";
  try {
    const id = ctx.options.getString("id");
    const guildId = ctx.guild.id;

    if (!RepliesManager.getRepliesByGuild(guildId).has(id)) {
      await ctx.reply({
        content: `❌ 找不到 ID 為 \`${id}\` 的自訂回應`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const deletedReply = RepliesManager.getRepliesByGuild(guildId).get(id); // 被刪除的資訊

    RepliesManager.deleteReply(guildId, id);

    logMessage = `自訂回應刪除，ID=${id}, 關鍵字=${deletedReply.keyword}, 回應=${deletedReply.response}`;
    let infoType = "success";
    let cmdNmae = "delrpy";
    let logInfo = {
      type: infoType,
      commandName: cmdNmae,
      guildName: guildName,
      userName: userName,
      nickname: nickname,
      content: logMessage,
      guildId: guildId,
      userId: userId,
    };
    logAction(logInfo);
    await ctx.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("自訂回應已刪除")
          .setColor("#FF0000")
          .addFields(
            { name: "ID", value: `\`${id}\``, inline: false },
            {
              name: "關鍵字",
              value: `\`${deletedReply.keyword}\``,
              inline: false,
            },
            { name: "回應", value: deletedReply.response, inline: false }
          ),
      ],
      // flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    logMessage = `自訂回應刪除錯誤，${error.message}`;
    logInfo.type = "error";
    logInfo.logMessage = logMessage;
    logAction(logInfo);
    await ctx.reply({
      content: "❌ 刪除自訂回應失敗，請稍後再試",
      flags: MessageFlags.Ephemeral,
    });
  }
};
