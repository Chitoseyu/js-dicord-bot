import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} from "discord.js";
import { useAppStore } from "@/store/app";

export const command = new SlashCommandBuilder()
  .setName("setrpy")
  .setDescription("設定文字的回覆內容")
  .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
  .setDMPermission(false)
  .addStringOption((option) =>
    option.setName("keyword").setDescription("觸發的關鍵字").setRequired(true)
  )
  .addStringOption((option) =>
    option.setName("response").setDescription("回應的內容").setRequired(true)
  );

export const action = async (ctx) => {
  try {
    const keyword = ctx.options.getString("keyword").toLowerCase();
    const response = ctx.options.getString("response");

    const appStore = useAppStore();
    appStore.replies.set(keyword, response);

    await ctx.reply({
      content: `✅ 成功設定！`,
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    await ctx.reply({
      content: "❌ 設定回覆失敗，請稍後再試。",
      flags: MessageFlags.Ephemeral,
    });
  }
};
