import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  MessageFlags,
} from "discord.js";
import { logAction } from "@/utils/logHelper";
import RepliesManager from "@/utils/serverSetting.js";

export const command = new SlashCommandBuilder()
  .setName("setrpy")
  .setDescription("設定關鍵字回應")
  .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
  .setDMPermission(false)
  .addStringOption((option) =>
    option.setName("keyword").setDescription("觸發關鍵字").setRequired(true)
  )
  .addStringOption((option) =>
    option.setName("response").setDescription("回應內容").setRequired(true)
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
    const guildId = ctx.guildId;
    const keyword = ctx.options.getString("keyword").toLowerCase();
    const response = ctx.options.getString("response");

    const uniqueId = RepliesManager.addReply(guildId, keyword, response);

    logMessage = `自訂回應設定，ID=${uniqueId}, 關鍵字=${keyword}, 回應=${response}`;
    let infoType = "success";
    let cmdNmae = "setrpy";
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
          .setTitle("新自訂回應")
          .setColor("#00FF00")
          .addFields(
            { name: "ID", value: `\`${uniqueId}\``, inline: false },
            { name: "關鍵字", value: `\`${keyword}\``, inline: false },
            { name: "回應", value: response, inline: false }
          ),
      ],
      // flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    logMessage = `自訂回應設定錯誤，${error.message}`;
    logInfo.type = "error";
    logInfo.content = logMessage;
    logAction(logInfo);
    await ctx.reply({
      content: "❌ 設定回應失敗，請稍後再試。",
      flags: MessageFlags.Ephemeral,
    });
  }
};
