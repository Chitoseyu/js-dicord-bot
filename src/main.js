import { Client, Events, GatewayIntentBits } from "discord.js";
import vueInit from "@/core/vue";
import dotenv from "dotenv";
import { useAppStore } from "@/store/app";
import { loadCommands, loadEvents } from "@/core/loader";

vueInit();
dotenv.config();

loadCommands();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const appStore = useAppStore();
appStore.client = client;

loadEvents();

// client.once(Events.ClientReady, (c) => {
//   console.log(`Ready! Logged in as ${c.user.tag}`);
// });

// Log in to Discord with your client's token
client.login(process.env.TOKEN);
