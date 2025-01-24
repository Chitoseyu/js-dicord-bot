import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
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

    const deletedReply = guildReplies.get(id); // 被刪除的資訊

    guildReplies.delete(id);
    appStore.replies.set(guildId, guildReplies);
    appStore.saveReplies();

    await ctx.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("自訂回應已刪除")
          .setColor("#FF0000")
          .addFields(
            { name: "ID", value: `\`${id}\``, inline: false },
            { name: "關鍵字", value: `\`${deletedReply.keyword}\``, inline: false },
            { name: "回應", value: deletedReply.response, inline: false }
          ),
      ],
      // flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    await ctx.reply({
      content: "❌ 刪除自訂回應失敗，請稍後再試",
      flags: MessageFlags.Ephemeral,
    });
  }
};
