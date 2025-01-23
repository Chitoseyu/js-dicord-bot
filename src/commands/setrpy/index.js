import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} from "discord.js";
import { useAppStore } from "@/store/app";
import { v4 as uuidv4 } from "uuid";

export const command = new SlashCommandBuilder()
  .setName("setrpy")
  .setDescription("設定關鍵字回應")
  .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
  .setDMPermission(false)
  .addStringOption((option) =>
    option.setName("keyword").setDescription("觸發關鍵字").setRequired(true)
  )
  .addStringOption((option) =>
    option.setName("response").setDescription("回應內容").setRequired(true)
  );

export const action = async (ctx) => {
  try {
    const guildId = ctx.guildId;
    const keyword = ctx.options.getString("keyword").toLowerCase();
    const response = ctx.options.getString("response");

    const appStore = useAppStore();
    if (!appStore.replies.has(guildId)) {
      appStore.replies.set(guildId, new Map());
    }

    const guildReplies = appStore.replies.get(guildId);
    const uniqueId = uuidv4().replace(/-/g, "").substring(0, 6);
    guildReplies.set(uniqueId, { keyword, response });

    appStore.saveReplies();

    await ctx.reply({
      content: `✅ 設定回應成功！`,
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    await ctx.reply({
      content: "❌ 設定回應失敗，請稍後再試。",
      flags: MessageFlags.Ephemeral,
    });
  }
};
