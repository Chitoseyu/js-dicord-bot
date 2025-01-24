import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
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

const generateUniqueId = (existingIds) => {
  let uniqueId;
  do {
    uniqueId = uuidv4().replace(/-/g, "").substring(0, 6); // 生成6位數
  } while (existingIds.has(uniqueId)); // 已存在則重產生
  return uniqueId;
};

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
    // 已存在的ID
    const existingIds = new Set(guildReplies.keys());
    // 避免ID衝突
    const uniqueId = generateUniqueId(existingIds);

    guildReplies.set(uniqueId, { keyword, response });

    appStore.saveReplies();

    await ctx.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("新自訂回應")
          .setColor("#00FF00")
          .addFields(
            { name: "ID", value: `\`${uniqueId}\``, inline: false },
            { name: "關鍵字", value: `\`${keyword}\``, inline: false },
            { name: "回應", value: response, inline: false }
          ),
      ],
      // flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    await ctx.reply({
      content: "❌ 設定回應失敗，請稍後再試。",
      flags: MessageFlags.Ephemeral,
    });
  }
};
