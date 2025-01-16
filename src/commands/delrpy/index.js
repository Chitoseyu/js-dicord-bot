import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} from "discord.js";
import { useAppStore } from "@/store/app";

export const command = new SlashCommandBuilder()
  .setName("delrpy")
  .setDescription("刪除關鍵字的回覆訊息")
  .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
  .setDMPermission(false)
  .addStringOption((option) =>
    option.setName("keyword").setDescription("刪除的關鍵字").setRequired(true)
  );

export const action = async (ctx) => {
  try {
    const keyword = ctx.options.getString("keyword").toLowerCase();
    const appStore = useAppStore();
    const guildId = ctx.guild.id;

    const guildReplies = appStore.replies.get(guildId);
    if (!guildReplies || !guildReplies.has(keyword)) {
      await ctx.reply({
        content: `❌ 無法找到 \`${keyword}\` 的回覆設定。`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    guildReplies.delete(keyword);
    appStore.replies.set(guildId, guildReplies);
    appStore.saveReplies();
    await ctx.reply({
      content: `✅ 已成功刪除 \`${keyword}\` 的回覆設定。`,
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    await ctx.reply({
      content: "❌ 刪除回覆設定失敗，請稍後再試。",
      flags: MessageFlags.Ephemeral,
    });
  }
};
