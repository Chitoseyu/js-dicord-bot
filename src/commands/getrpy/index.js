import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  MessageFlags,
} from "discord.js";
import { useAppStore } from "@/store/app";

export const command = new SlashCommandBuilder()
  .setName("getrpy")
  .setDescription("查看關鍵字的自訂回應")
  .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
  .setDMPermission(false);

export const action = async (ctx) => {
  try {
    // 延遲回應，確保互動被正確處理
    await ctx.deferReply({ flags: MessageFlags.Ephemeral });

    const guildId = ctx.guildId;
    const appStore = useAppStore();

    // 確認該伺服器是否有設定
    if (!appStore.replies.has(guildId)) {
      return await ctx.editReply("❌ 尚未設定任何回應！");
    }
    const guildReplies = appStore.replies.get(guildId);

    const embed = new EmbedBuilder();

    let responseText = "";

    guildReplies.forEach((reply, id) => {
      responseText += `\`#${id}\`${reply.keyword} 💬 ${reply.response}\n`;
    });

    if (responseText.trim()) {
      embed.addFields({
        name: "🤖 自訂回應",
        value: responseText,
        inline: false,
      });
    } else {
      embed.addFields({
        name: "🤖 自訂回應",
        value: "尚未設定回應",
        inline: false,
      });
    }

    await ctx.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  } catch (error) {
    await ctx.reply({
      content: "❌ 查詢自訂回應時出錯，請稍後再試",
      flags: MessageFlags.Ephemeral,
    });
  }
};
