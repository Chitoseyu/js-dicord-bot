import fs from "fs";
import path from "path";

const settingsFile = path.resolve("./settings.json");

export function getServerSettings(guildId) {
  if (!fs.existsSync(settingsFile)) return false;
  const data = JSON.parse(fs.readFileSync(settingsFile, "utf8"));
  return data[guildId] ?? false;
}
export function saveServerSettings(guildId, enabled) {
  let data = {};
  if (fs.existsSync(settingsFile)) {
    data = JSON.parse(fs.readFileSync(settingsFile, "utf8"));
  }
  data[guildId] = enabled;
  fs.writeFileSync(settingsFile, JSON.stringify(data, null, 2));
}
