import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} from "discord.js";
import { logAction } from "@/utils/logHelper";

export const command = new SlashCommandBuilder()
  .setName("delete")
  .setDescription("刪除頻道中的多筆訊息")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .setDMPermission(false)
  .addIntegerOption((option) =>
    option
      .setName("count")
      .setDescription("要刪除的訊息數量（最多 100）")
      .setRequired(true)
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
    const count = ctx.options.getInteger("count");
    if (count < 1 || count > 100) {
      return await ctx.reply({
        content: "❌ 請輸入 1 到 100 之間的訊息數量。",
        flags: MessageFlags.Ephemeral,
      });
    }

    const messages = await ctx.channel.messages.fetch({ limit: count });
    const now = Date.now();

    // 分類訊息
    const recentMessages = [];
    const oldMessages = [];

    for (const [_, message] of messages) {
      if (message.createdAt.getTime() > now - 14 * 24 * 60 * 60 * 1000) {
        recentMessages.push(message);
      } else {
        oldMessages.push(message);
      }
    }

    // 刪除 14 天內的訊息
    if (recentMessages.length > 0) {
      await ctx.channel
        .bulkDelete(recentMessages)
        .catch((err) => console.error("❌ Bulk delete failed:", err));
    }

    // 刪除超過 14 天的訊息
    for (const message of oldMessages) {
      await message
        .delete()
        .catch((err) => console.error("❌ Individual delete failed:", err));
    }

    // 回應結果
    const totalDeleted = recentMessages.length + oldMessages.length;

    logMessage = `刪除訊息 ${totalDeleted} 筆，14 天內 ${recentMessages.length} 筆，超過 14 天 ${oldMessages.length} 筆`;

    let infoType = "success";
    let cmdNmae = "delete";
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

    const botReply = await ctx.reply({
      content: `✅ 已成功刪除 ${totalDeleted} 筆訊息( 3 秒後自動刪除)`,
    });
    setTimeout(() => botReply.delete().catch(console.error), 3000);
  } catch (error) {
    logMessage = `刪除訊息錯誤，${error.message}`;
    logInfo.type = "error";
    logInfo.logMessage = logMessage;
    logAction(logInfo);
    await ctx.reply({
      content: "❌ 刪除訊息失敗",
      flags: MessageFlags.Ephemeral,
    });
  }
};
