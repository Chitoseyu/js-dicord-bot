import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} from "discord.js";
import { addReminder } from "@/utils/reminderChecker";

export const command = new SlashCommandBuilder()
  .setName("setnotify")
  .setDescription("設定時間提醒任務")
  .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
  .setDMPermission(false)
  .addUserOption((option) =>
    option.setName("user").setDescription("要提醒的使用者").setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("time")
      .setDescription("提醒時間 (格式: MM-DD HH:mm，例如 01-18 13:30)")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option.setName("message").setDescription("提醒內容").setRequired(true)
  );

export const action = async (ctx) => {
  try {
    const user = ctx.options.getUser("user");
    const timeInput = ctx.options.getString("time");
    const message = ctx.options.getString("message");

    // 驗證時間格式
    const TIME_FORMAT_REGEX =
      /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01]) ([01]\d|2[0-3]):([0-5]\d)$/;

    if (!TIME_FORMAT_REGEX.test(timeInput)) {
      return await ctx.reply({
        content:
          "❌ 提醒時間格式無效，請使用格式 MM-DD HH:mm，例如 01-18 13:30。",
        flags: MessageFlags.Ephemeral,
      });
    }
    // 獲取當前年份，並轉換為完整日期
    const [month, day, hour, minute] = timeInput.split(/[- :]/).map(Number);
    const now = new Date();
    const year = now.getFullYear();
    const reminderTime = new Date(year, month - 1, day, hour, minute);

    // 驗證時間是否為未來
    if (reminderTime <= now) {
      return await ctx.reply({
        content: "❌ 提醒時間必須是未來時間。",
        flags: MessageFlags.Ephemeral,
      });
    }

    // 建立提醒對象
    const reminder = {
      userId: user.id,
      channelId: ctx.channelId,
      time: reminderTime.toISOString(),
      message,
    };

    await addReminder(reminder, ctx.client);

    const bot_reply = await ctx.reply({
      content: `⏰ 提醒已設定！時間：${timeInput}，提醒對象：${user.username}。`,
      flags: MessageFlags.Ephemeral,
    });

    setTimeout(() => bot_reply.delete().catch(console.error), 3000);
  } catch (error) {
    console.error("❌ 設定提醒任務時出錯：", error);
    await ctx.reply({
      content: "❌ 設定提醒任務時出錯，請稍後再試。",
      flags: MessageFlags.Ephemeral,
    });
  }
};
