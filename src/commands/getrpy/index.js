import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  MessageFlags,
} from "discord.js";
import { useAppStore } from "@/store/app";

export const command = new SlashCommandBuilder()
  .setName("getrpy")
  .setDescription("查看目前設置的所有回覆字串")
  .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
  .setDMPermission(false);

export const action = async (ctx) => {
  try {
    const appStore = useAppStore();
    const replies = appStore.replies;

    if (replies.size === 0) {
      await ctx.reply({
        content: "目前沒有設定任何回覆字串。",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const embed = new EmbedBuilder()
      .setTitle("設置的回覆字串")
      .setColor("#0099ff");

    replies.forEach((response, keyword) => {
      embed.addFields({
        name: `\`${keyword}\``,
        value: `${response}`,
        inline: false,
      });
    });
    await ctx.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    await ctx.reply({
      content: "❌ 查詢回覆字串時出錯，請稍後再試。",
      flags: MessageFlags.Ephemeral,
    });
  }
};
