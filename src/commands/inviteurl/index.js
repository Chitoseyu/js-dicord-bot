import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} from "discord.js";

export const command = new SlashCommandBuilder()
  .setName("inviturl")
  .setDescription("產生邀請連結")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .setDMPermission(false);

export const action = async (ctx) => {
  try {
    const inviteURL = ctx.client.generateInvite({
      scopes: ["bot", "applications.commands"], // 使用 bot 和 slash commands
      permissions: [
        "SendMessages", // 發送訊息
        "ManageMessages", // 管理訊息
        "AddReactions", // 添加反應
        "ReadMessageHistory", // 讀取訊息記錄
        "ManageRoles", // 管理身分組
        "UseApplicationCommands", // 對話指令註冊
      ],
    });
    await ctx.reply({
      content: `邀請連結已生成：\n${inviteURL}`,
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    console.error("生成邀請連結時出現問題：", error);
    await ctx.reply({
      content: "生成邀請連結失敗，請稍後再試。",
      flags: MessageFlags.Ephemeral,
    });
  }
};
