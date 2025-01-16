import { Client, Events, GatewayIntentBits } from "discord.js";
import express from "express";
import vueInit from "@/core/vue";
import dotenv from "dotenv";
import { useAppStore } from "@/store/app";
import { loadCommands, loadEvents } from "@/core/loader";
import statusRoutes from "./routes/index.js";

vueInit();
dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});
const appStore = useAppStore();
appStore.client = client;

loadCommands(client);
loadEvents();

client.login(process.env.TOKEN);

const app = express();
const PORT = process.env.WEB_PORT || 3000;

app.use((req, res, next) => {
  req.client = client;
  next();
});

app.use("/", statusRoutes);

app.listen(PORT, () => {
  console.log(`啟動網站： http://localhost:${PORT}`);
});
