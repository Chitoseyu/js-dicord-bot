import { REST, Routes, Collection } from "discord.js";
import fg from "fast-glob";
import { useAppStore } from "@/store/app";


const updateSlashCommands = async (commands,client) => {
  const rest = new REST().setToken(process.env.TOKEN);

  try {
    const guilds = await client.guilds.fetch();
   
    for (const [guildId, guild] of guilds) {
      //console.log(`📤 正在上傳指令到群組：${guild.name}`);
      await rest.put(
        Routes.applicationGuildCommands(process.env.APP_ID, guildId),
        { body: commands, }
      );
    }
  } catch (error) {
    console.error(`❌ 無法上傳指令到群組：${guild.name}`, error);
  }
};

export const loadCommands = async (client) => {
  const appStore = useAppStore();
  const commands = [];
  const actions = new Collection();

  const files = await fg("./src/commands/**/index.js");

  for (const file of files) {
    const cmd = await import(file);
    commands.push(cmd.command);
    actions.set(cmd.command.name, cmd.action);
  }

  await updateSlashCommands(commands,client);
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
