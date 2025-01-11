import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
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
        ephemeral: true,
      });
      return;
    }
    let replyContent = "目前設置的回覆字串：\n";
    replies.forEach((response, keyword) => {
      replyContent += `**${keyword}**: ${response}\n`;
    });

    // 回傳目前的回覆設定
    await ctx.reply({
      content: replyContent,
      ephemeral: true,
    });
  } catch (error) {
    await ctx.reply({
      content: "❌ 查詢回覆字串時出錯，請稍後再試。",
      ephemeral: true,
    });
  }
};
