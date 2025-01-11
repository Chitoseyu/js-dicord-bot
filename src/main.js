import { Client, Events, GatewayIntentBits } from "discord.js";
import vueInit from "@/core/vue";
import dotenv from "dotenv";
import { useAppStore } from "@/store/app";
import { loadCommands, loadEvents } from "@/core/loader";

vueInit();
dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
const appStore = useAppStore();
appStore.client = client;

loadCommands(client);
loadEvents();

client.login(process.env.TOKEN);
