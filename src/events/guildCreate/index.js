import { Events, REST, Routes, Collection } from "discord.js";
import fg from "fast-glob";
import { useAppStore } from "@/store/app";
export const event = {
  name: Events.GuildCreate,
  once: false,
};

export const action = async (guild) => {
  console.log(`加入新的伺服器: ${guild.name} (ID: ${guild.id})`);

  const appStore = useAppStore();
  const commands = [];
  const actions = new Collection();

  const command_files = await fg("./src/commands/**/index.js");

  for (const file of command_files) {
    const cmd = await import(file);
    commands.push(cmd.command);
    actions.set(cmd.command.name, cmd.action);
  }
  appStore.loadReplies();

  try {
    const rest = new REST().setToken(process.env.TOKEN);

    await rest.put(
      Routes.applicationGuildCommands(process.env.APP_ID, guild.id),
      { body: commands }
    );
    // console.log(`在伺服器 ${guild.name} 註冊了 Slash 指令`);
  } catch (error) {
    console.error(`❌ 無法註冊指令到群組：${guild.name}`, error);
  }
  appStore.commandsActionMap = actions;

  //loadEvents
  try {
    const client = appStore.client;
    const event_files = await fg("./src/events/**/index.js");
    for (const file of event_files) {
      const eventFile = await import(file);
      const listeners = client.listeners(eventFile.event.name);
      if (listeners.length === 0) {
        if (eventFile.event.once) {
          client.once(eventFile.event.name, eventFile.action);
        } else {
          client.on(eventFile.event.name, eventFile.action);
        }
      }
    }
  } catch (error) {
    console.error(`❌ 無法載入事件到群組：${guild.name}`, error);
  }
};
