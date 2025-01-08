import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export const command = new SlashCommandBuilder()
  .setName("sayd")
  .setDescription("讓機器人重複說過的話")
  .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
  .setDMPermission(false)
  .addStringOption((string)=>string.setName("text").setDescription("重複的話").setRequired(true));

export const action = async (ctx) => {
  try{
    const message = ctx.options.getString("text");

    await ctx.channel.send(message);

    const bot_reply = await ctx.reply({
      content: "✅ 已成功發送訊息。",
      ephemeral: true,
    });
    setTimeout(() => bot_reply.delete().catch(console.error), 3000);

  }catch(error){
    await ctx.reply({
      content: "❌ 發生錯誤，請稍後再試。",
      ephemeral: true, //私人訊息
    });
  }
};
