import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} from "discord.js";
import { saveServerSettings, getServerSettings } from "@/utils/serverSetting";

export const command = new SlashCommandBuilder()
  .setName("setgreet")
  .setDescription("設定成員加入/離開通知")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addBooleanOption((option) =>
    option.setName("enabled").setDescription("是否開啟通知").setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("join_message")
      .setDescription("【 選填 】成員加入時的訊息 (使用 {user} 來代表成員)")
      .setRequired(false)
  )
  .addStringOption((option) =>
    option
      .setName("leave_message")
      .setDescription("【 選填 】成員離開時的訊息 (使用 {user} 來代表成員)")
      .setRequired(false)
  );

export const action = async (ctx) => {
  try {
    const enabled = ctx.options.getBoolean("enabled");
    const joinMessage = ctx.options.getString("join_message");
    const leaveMessage = ctx.options.getString("leave_message");

    const guildId = ctx.guild.id;

    let settings = {
      guildId: guildId,
      enabled: enabled,
    };
    let default_join = "🎉 歡迎新成員 {user} 加入！";
    let default_leave = "👋 成員 {user} 離開了 我們懷念他 😢";

    // 讀取現有設定
    const currentSettings = getServerSettings(guildId);

    if (currentSettings) {
      default_join = currentSettings.joinMessage;
      default_leave = currentSettings.leaveMessage;
    }

    settings.joinMessage = joinMessage ? joinMessage : default_join;
    settings.leaveMessage = leaveMessage ? leaveMessage : default_leave;

    // 儲存新設定
    const greetSettings = await saveServerSettings(settings);

    await ctx.reply({
      content:
        `✅ 成員加入/離開通知 已${enabled ? "開啟" : "關閉"}！\n` +
        `📢 加入訊息: ${greetSettings.joinMessage}\n` +
        `📢 離開訊息: ${greetSettings.leaveMessage}\n`,
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    console.error("❌ 設定成員加入/離開通知失敗：", error);
    await ctx.reply({
      content: "❌ 設定時發生錯誤，請稍後再試。",
      flags: MessageFlags.Ephemeral,
    });
  }
};
