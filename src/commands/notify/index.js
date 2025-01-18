import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} from "discord.js";
import fs from "fs/promises";
import path from "path";

const REMINDERS_FILE = path.resolve("./reminders.json");

export const command = new SlashCommandBuilder()
  .setName("notify")
  .setDescription("在指定的時間提醒使用者訊息")
  .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
  .setDMPermission(false)
  .addUserOption((option) =>
    option.setName("user").setDescription("要提醒的使用者").setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("time")
      .setDescription("提醒時間 (格式: YYYY-MM-DD HH:mm)")
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
      /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01]) ([01][0-9]|2[0-3]):([0-5][0-9])$/;

    if (!TIME_FORMAT_REGEX.test(timeInput)) {
      return await ctx.reply({
        content: "❌ 提醒時間格式無效，請使用格式 YYYY-MM-DD HH:mm。",
        flags: MessageFlags.Ephemeral,
      });
    }
    // 將時間字串解析為日期物件
    const reminderTime = new Date(`${timeInput}:00`); // 加上秒數避免解析問題
    if (isNaN(reminderTime.getTime())) {
      return await ctx.reply({
        content: "❌ 提醒時間無效，請提供有效的日期與時間。",
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

    // 讀取現有提醒
    let reminders = [];
    try {
      const data = await fs.readFile(REMINDERS_FILE, "utf-8");
      reminders = JSON.parse(data);
    } catch {
      // 檔案不存在，無處理
    }
    // 加入新提醒並儲存
    reminders.push(reminder);
    await fs.writeFile(REMINDERS_FILE, JSON.stringify(reminders, null, 2));

    await ctx.reply({
      content: `⏰ 提醒已設定！時間：${timeInput}，提醒對象：${user.username}。`,
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    console.error("❌ 設定提醒時出錯：", error);
    await ctx.reply({
      content: "❌ 設定提醒時出錯，請稍後再試。",
      flags: MessageFlags.Ephemeral,
    });
  }
};
