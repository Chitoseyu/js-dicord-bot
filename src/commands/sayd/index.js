import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} from "discord.js";
import fs from "fs";
import { getLogFileName } from "@/utils/logHelper";

export const command = new SlashCommandBuilder()
  .setName("sayd")
  .setDescription("讓Bot回覆")
  .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
  .setDMPermission(false)
  .addStringOption((string) =>
    string.setName("text").setDescription("回覆訊息").setRequired(true)
  );

const getTaipeiTime = () => {
  const now = new Date();
  const taipeiTime = now.toLocaleString("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false, 
  });
  return taipeiTime;
};

export const action = async (ctx) => {
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

    // 記錄使用者訊息到日誌檔案
    const guildName = ctx.guild.name; // 群組名稱
    const userName = ctx.member?.displayName || ctx.user.username; // 用戶名稱
    const nickname = ctx.member.nickname || "無"; // 群組暱稱
    const now = getTaipeiTime();
    const logMessage = `
     [${now}] 
      群組：${guildName} | 
      用戶：${userName}  | 
      群名片：${nickname} | 
      發送內容：${message}\n`;

    const logFileName = getLogFileName("sayd");
    fs.appendFileSync(logFileName, logMessage);

    const bot_reply = await ctx.reply({
      content: "✅ 已成功發送訊息( 3 秒後自動刪除)",
      flags: MessageFlags.Ephemeral,
    });
    setTimeout(() => bot_reply.delete().catch(console.error), 3000);
  } catch (error) {
    await ctx.reply({
      content: "❌ 發生錯誤，請稍後再試。",
      flags: MessageFlags.Ephemeral,
    });
  }
};
