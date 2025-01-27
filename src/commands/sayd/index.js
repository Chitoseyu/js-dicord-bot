import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} from "discord.js";
import fs from "fs";
import { logAction } from "@/utils/logHelper";

export const command = new SlashCommandBuilder()
  .setName("sayd")
  .setDescription("讓Bot回覆")
  .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
  .setDMPermission(false)
  .addStringOption((string) =>
    string.setName("text").setDescription("回覆訊息").setRequired(true)
  );

export const action = async (ctx) => {
  // 記錄使用者訊息到日誌檔案
  const guildName = ctx.guild.name; // 群組名稱
  const userName = ctx.member?.displayName || ctx.user.username; // 用戶名稱
  const nickname = ctx.member.nickname || "無"; // 群組暱稱
  let logMessage = "";
  try {
    const message = ctx.options.getString("text");
    // 檢查發言內容限制
    if (message.includes("@everyone") || message.includes("@here")) {
      return await ctx.reply({
        content: "❌ 禁止包含 `@everyone` 或 `@here`。",
        flags: MessageFlags.Ephemeral,
      });
    }
    // 檢查機器人發言權限
    if (!ctx.channel.permissionsFor(ctx.guild.members.me).has("SendMessages")) {
      return await ctx.reply({
        content: "❌ 機器人無法在此頻道發送訊息。",
        flags: MessageFlags.Ephemeral,
      });
    }

    await ctx.channel.send(message);

    logMessage = `Bot發言，${message}`;

    logAction("success", "sayd", guildName, userName, nickname, logMessage);

    const bot_reply = await ctx.reply({
      content: "✅ 已成功發送訊息( 3 秒後自動刪除)",
      flags: MessageFlags.Ephemeral,
    });
    setTimeout(() => bot_reply.delete().catch(console.error), 3000);
  } catch (error) {
    logMessage = `Bot發言錯誤，${error.message}`;
    logAction("error", "sayd", guildName, userName, nickname, logMessage);

    await ctx.reply({
      content: "❌ 發生錯誤，請稍後再試。",
      flags: MessageFlags.Ephemeral,
    });
  }
};
