import { REST, Routes, Collection } from "discord.js";
import fg from "fast-glob";
import { useAppStore } from "@/store/app";

const updateSlashCommands = async (commands, client) => {
  const rest = new REST().setToken(process.env.TOKEN);

  try {
    const guilds = await client.guilds.fetch();

    for (const [guildId, guild] of guilds) {
      const isTestGuild = process.env.TEST_GUILD_ID === guildId;

      // 根據測試與非測試伺服器分別設置
      const filteredCommands = isTestGuild
        ? commands
        : commands.filter((cmd) => cmd.devOnly !== true);

      try {
        // console.log(
        //   `📤 正在上傳指令到群組：${guild.name}，註冊數：${filteredCommands.length}`
        // );
        await rest.put(
          Routes.applicationGuildCommands(process.env.APP_ID, guildId),
          { body: filteredCommands }
        );
      } catch (error) {
        console.error(`❌ 無法上傳指令到群組：${guild.name}`, error);
      }
    }
  } catch (error) {
    console.error("❌ 無法取得群組列表", error);
  }
};

export const loadCommands = async (client) => {
  const appStore = useAppStore();
  const commands = [];
  const actions = new Collection();

  const files = await fg("./src/commands/**/index.js");

  for (const file of files) {
    const cmd = await import(file);
    // 區分是否為開發用指令
    if (cmd.command.devOnly === undefined) {
      cmd.command.devOnly = false;
    }

    commands.push(cmd.command);
    actions.set(cmd.command.name, cmd.action);
  }
  appStore.loadReplies();
  await updateSlashCommands(commands, client);
  appStore.commandsActionMap = actions;
};

export const loadEvents = async () => {
  const appStore = useAppStore();
  const client = appStore.client;
  const files = await fg("./src/events/**/index.js");
  for (const file of files) {
    const eventFile = await import(file);
    if (eventFile.event.once) {
      client.once(eventFile.event.name, eventFile.action);
    } else {
      client.on(eventFile.event.name, eventFile.action);
    }
  }
};
