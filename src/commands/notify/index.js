import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} from "discord.js";

export const command = new SlashCommandBuilder()
  .setName("notify")
  .setDescription("在幾分鐘後提醒使用者訊息")
  .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
  .setDMPermission(false)
  .addUserOption((option) =>
    option.setName("user").setDescription("要提醒的使用者").setRequired(true)
  )
  .addIntegerOption((option) =>
    option.setName("time").setDescription("提醒時間（分鐘）").setRequired(true)
  )
  .addStringOption((option) =>
    option.setName("message").setDescription("提醒內容").setRequired(true)
  );

export const action = async (ctx) => {
  try {
    const user = ctx.options.getUser("user");
    const time = ctx.options.getInteger("time");
    const message = ctx.options.getString("message");

    if (time <= 0) {
      return await ctx.reply({
        content: "❌ 時間必須為正數（分鐘）。",
        flags: MessageFlags.Ephemeral,
      });
    }

    // 確認設定的提醒
    await ctx.reply({
      content: `⏰ 將在 ${time} 分鐘後提醒 ${user.username}。`,
      flags: MessageFlags.Ephemeral,
    });

    setTimeout(async () => {
      await ctx.channel.send({
        content: `<@${user.id}>${message}`,
      });
    }, time * 60 * 1000);
  } catch (error) {
    await ctx.reply({
      content: "❌ 設定提醒失敗，請稍後再試。",
      flags: MessageFlags.Ephemeral,
    });
  }
};
