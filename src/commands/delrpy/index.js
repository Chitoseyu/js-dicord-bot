import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} from "discord.js";
import { useAppStore } from "@/store/app";

export const command = new SlashCommandBuilder()
  .setName("delrpy")
  .setDescription("刪除關鍵字的自訂回應")
  .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
  .setDMPermission(false)
  .addStringOption((option) =>
    option.setName("id").setDescription("關鍵字的ID").setRequired(true)
  );

export const action = async (ctx) => {
  try {
    const id = ctx.options.getString("id");
    const appStore = useAppStore();
    const guildId = ctx.guild.id;

    const guildReplies = appStore.replies.get(guildId);
    if (!guildReplies || !guildReplies.has(id)) {
      await ctx.reply({
        content: `❌ 無法找到 ID 為 \`${id}\` 的自訂回應`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    guildReplies.delete(id);
    appStore.replies.set(guildId, guildReplies);
    appStore.saveReplies();
    await ctx.reply({
      content: `✅ 已成功刪除 ID 為 \`${id}\` 的自訂回應`,
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    await ctx.reply({
      content: "❌ 刪除自訂回應失敗，請稍後再試",
      flags: MessageFlags.Ephemeral,
    });
  }
};
