import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} from "discord.js";

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
  try {
    if (!ctx.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return await ctx.reply({
        content: "❌ 你沒有管理員權限，無法使用此指令。",
        flags: MessageFlags.Ephemeral,
      });
    }
    const count = ctx.options.getInteger("count");

    if (count < 1 || count > 100) {
      return await ctx.reply({
        content: "❌ 請輸入 1 到 100 之間的訊息數量。",
        flags: MessageFlags.Ephemeral,
      });
    }
    const deletedMessages = await ctx.channel.bulkDelete(count, true);
    const bot_reply = await ctx.reply({
      content: `✅ 已成功刪除 ${deletedMessages.size} 筆訊息！`,
    });
    setTimeout(() => bot_reply.delete().catch(console.error), 3000);
  } catch (error) {
    await ctx.reply({
      content: "❌ 刪除訊息失敗",
      flags: MessageFlags.Ephemeral,
    });
  }
};
