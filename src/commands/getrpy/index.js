import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} from "discord.js";
import RepliesManager from "@/utils/serverSetting.js";

const ITEMS_PER_PAGE = 10; // 指令每頁顯示數量

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
    const guildReplies = RepliesManager.getReplies(guildId);
    if (guildReplies.size === 0) {
      return await ctx.editReply("❌ 尚未設定任何回應！");
    }

    // 分頁處理資料
    const paginatedData = [];
    const allEntries = [...guildReplies.entries()];
    for (let i = 0; i < allEntries.length; i += ITEMS_PER_PAGE) {
      paginatedData.push(allEntries.slice(i, i + ITEMS_PER_PAGE));
    }

    let currentPage = 0;

    const createEmbed = (page) => {
      const embed = new EmbedBuilder()
        .setTitle("🤖 自訂回應")
        .setColor("#0099ff");

      const pageData = paginatedData[page] || [];
      let responseText = "";

      pageData.forEach(([id, reply]) => {
        responseText += `\`${id}\` ${reply.keyword} 💬 ${reply.response}\n`;
      });

      embed.setDescription(responseText || "尚未設定回應");
      embed.setFooter({ text: `${page + 1}/${paginatedData.length}` });
      return embed;
    };

    // 初始化按鈕
    const createButtons = (page) => {
      return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("prev")
          .setLabel("⬅️")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === 0), // 第一頁禁用
        new ButtonBuilder()
          .setCustomId("next")
          .setLabel("➡️")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === paginatedData.length - 1) // 最後一頁禁用
      );
    };

    // 回應初始 Embed 和按鈕
    await ctx.editReply({
      embeds: [createEmbed(currentPage)],
      components: [createButtons(currentPage)],
    });

    const collector = ctx.channel.createMessageComponentCollector({
      filter: (interaction) =>
        interaction.user.id === ctx.user.id &&
        ["prev", "next"].includes(interaction.customId),
      time: 60000, // 設置過期時間（60 秒）
    });

    collector.on("collect", async (interaction) => {
      try {
        // 更新頁數
        if (interaction.customId === "prev" && currentPage > 0) {
          currentPage--;
        } else if (
          interaction.customId === "next" &&
          currentPage < paginatedData.length - 1
        ) {
          currentPage++;
        }

        // 回應互動，更新 Embed 和按鈕
        await interaction.update({
          embeds: [createEmbed(currentPage)],
          components: [createButtons(currentPage)],
        });
      } catch (error) {
        console.error("Error updating interaction:", error);
      }
    });

    collector.on("end", async () => {
      // 互動過期禁用按鈕
      await ctx.editReply({
        components: [],
      });
    });
  } catch (error) {
    console.log(error.message);
    await ctx.editReply({
      content: "❌ 查詢自訂回應時出錯，請稍後再試",
      flags: MessageFlags.Ephemeral,
    });
  }
};
