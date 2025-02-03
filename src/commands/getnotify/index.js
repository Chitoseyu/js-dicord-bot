import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  MessageFlags,
} from "discord.js";
import { getReminder, formatReminderTime } from "@/utils/reminderChecker";

export const command = new SlashCommandBuilder()
  .setName("getnotify")
  .setDescription("顯示提醒任務")
  .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
  .setDMPermission(false);

export const action = async (ctx) => {
  try {
    // 讀取提醒數據
    const reminders = await getReminder();

    // 篩選當前伺服器的提醒
    const serverReminders = reminders.filter(
      (reminder) =>
        reminder.channelId === ctx.channelId &&
        new Date(reminder.time) > new Date()
    );

    if (serverReminders.length === 0) {
      return await ctx.reply({
        content: "❌ 沒有提醒任務，使用 /setnotify 新增提醒任務。",
        flags: MessageFlags.Ephemeral,
      });
    }

    // 構建 Embed
    const embed = new EmbedBuilder()
      .setTitle("📋 提醒任務")
      .setColor("#00AAFF")
      .setFooter({ text: "使用 /setnotify 新增提醒任務" });

    serverReminders.forEach((reminder, index) => {
      let reminder_time = formatReminderTime(reminder.time);

      embed.addFields({
        name: `#${index + 1} 任務`,
        value: `**ID**: ${reminder.id}\n**對象**: <@${reminder.userId}>\n**時間**: ${reminder_time}\n**內容**: ${reminder.message}`,
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
