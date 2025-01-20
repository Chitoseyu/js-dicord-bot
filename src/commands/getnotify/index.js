import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  MessageFlags,
} from "discord.js";
import fs from "fs/promises";
import path from "path";

const REMINDERS_FILE = path.resolve("./reminders.json");

export const command = new SlashCommandBuilder()
  .setName("getnotify")
  .setDescription("顯示目前的提醒任務")
  .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
  .setDMPermission(false);

export const action = async (ctx) => {
  try {
    // 讀取提醒數據
    let reminders = [];
    try {
      const data = await fs.readFile(REMINDERS_FILE, "utf-8");
      reminders = JSON.parse(data);
    } catch {
      // 檔案不存在，忽略
    }

    // 篩選當前伺服器的提醒
    const serverReminders = reminders.filter(
      (reminder) =>
        reminder.channelId === ctx.channelId &&
        new Date(reminder.time) > new Date()
    );

    if (serverReminders.length === 0) {
      return await ctx.reply({
        content: "❌ 目前沒有提醒任務，使用 /setnotify 新增提醒任務。",
        flags: MessageFlags.Ephemeral,
      });
    }

    // 構建 Embed
    const embed = new EmbedBuilder()
      .setTitle("📋 目前的提醒任務")
      .setColor("#00AAFF")
      .setFooter({ text: "使用 /setnotify 新增提醒任務" });

    serverReminders.forEach((reminder, index) => {
      embed.addFields({
        name: `#${index + 1} 任務`,
        value: `**用戶**: <@${reminder.userId}>\n**時間**: ${new Date(
          reminder.time
        ).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}\n**訊息**: ${
          reminder.message
        }`,
      });
    });

    await ctx.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    console.error("❌ 顯示提醒任務時出錯：", error);
    await ctx.reply({
      content: "❌ 顯示提醒任務時出錯，請稍後再試。",
      flags: MessageFlags.Ephemeral,
    });
  }
};
