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
    const botReply = await ctx.reply({
      content: `✅ 已成功刪除 ${totalDeleted} 筆訊息( 3 秒後自動刪除)`,
    });
    setTimeout(() => botReply.delete().catch(console.error), 3000);
  } catch (error) {
    await ctx.reply({
      content: "❌ 刪除訊息失敗",
      flags: MessageFlags.Ephemeral,
    });
  }
};
