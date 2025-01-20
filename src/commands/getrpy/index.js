import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  MessageFlags,
} from "discord.js";
import { useAppStore } from "@/store/app";

export const command = new SlashCommandBuilder()
  .setName("getrpy")
  .setDescription("查看關鍵字的回覆訊息")
  .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
  .setDMPermission(false);

export const action = async (ctx) => {
  try {
    // 延遲回應，確保互動被正確處理
    await ctx.deferReply({ flags: MessageFlags.Ephemeral });

    const guildId = ctx.guildId;
    const appStore = useAppStore();

    // 確認該伺服器是否有回覆設定
    if (!appStore.replies.has(guildId)) {
      return await ctx.editReply("❌ 尚未設定任何回覆訊息！");
    }
    const guildReplies = appStore.replies.get(guildId);

    const embed = new EmbedBuilder()
      .setTitle("💬 設置的回覆訊息")
      .setColor("#0099ff");

    guildReplies.forEach((response, keyword) => {
      embed.addFields({
        name: `\`${keyword}\``,
        value: `${response}`,
        inline: false,
      });
    });

    await ctx.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  } catch (error) {
    await ctx.reply({
      content: "❌ 查詢回覆訊息時出錯，請稍後再試。",
      flags: MessageFlags.Ephemeral,
    });
  }
};
