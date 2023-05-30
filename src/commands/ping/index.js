import { SlashCommandBuilder } from "discord.js";

export const command = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("確認機器人延遲資訊");

export const action = async (ctx) => {
  const sent = await ctx.reply({
    content: "正在計算延遲 ......",
    fetchReply: true,
  });

  const ping_data = sent.createdTimestamp - ctx.createdTimestamp;

  await ctx.editReply(
    `Bot latency: ${ping_data}ms,  API latency: ${ctx.client.ws.ping}ms`
  );
};
