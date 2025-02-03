import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
  EmbedBuilder,
} from "discord.js";
import { deleteReminder, formatReminderTime } from "@/utils/reminderChecker";

export const command = new SlashCommandBuilder()
  .setName("delnotify")
  .setDescription("刪除提醒任務")
  .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
  .setDMPermission(false)
  .addIntegerOption((option) =>
    option.setName("id").setDescription("任務的ID").setRequired(true)
  );

export const action = async (ctx) => {
  try {
    const reminderId = ctx.options.getInteger("id");

    const deletedReminder = await deleteReminder(reminderId, ctx.client);

    if (deletedReminder.length === 0) {
      return await ctx.reply({
        content: `❌ 找不到 ID 為 \`${reminderId}\` 的提醒任務`,
        flags: MessageFlags.Ephemeral,
      });
    } else {
      let delete_notfiy_time = formatReminderTime(deletedReminder.time);

      await ctx.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("提醒任務已刪除")
            .setColor("#FF0000")
            .addFields(
              // { name: "ID", value: `\`${deletedReminder.id}\``, inline: false },
              {
                name: "對象",
                value: `<@${deletedReminder.userId}>`,
                inline: false,
              },
              {
                name: "時間",
                value: delete_notfiy_time,
                inline: false,
              },
              { name: "內容", value: deletedReminder.message, inline: false }
            ),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  } catch (error) {
    console.error("❌ 刪除提醒任務時出錯：", error);
    await ctx.reply({
      content: "❌ 刪除提醒任務時出錯，請稍後再試。",
      flags: MessageFlags.Ephemeral,
    });
  }
};
