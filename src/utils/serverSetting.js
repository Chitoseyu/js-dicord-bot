import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { useAppStore } from "@/store/app";

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

const db = global.db;
const appStore = useAppStore();

const generateUniqueId = (existingIds) => {
  let uniqueId;
  do {
    uniqueId = uuidv4().replace(/-/g, "").substring(0, 6); // 生成6位數
  } while (existingIds.has(uniqueId)); // 已存在則重產生
  return uniqueId;
};
const RepliesManager = {
  get replies() {
    return appStore.replies;
  },
  getReplies(guildId) {
    const rows = db
      .prepare(
        "SELECT uniqueId, keyword, response FROM replies WHERE guildId = ?"
      )
      .all(guildId);

    return new Map(
      rows.map((row) => [
        row.uniqueId,
        { keyword: row.keyword, response: row.response },
      ])
    );
  },
  // 新增回覆
  addReply(guildId, keyword, response) {
    try {
      if (!this.replies.has(guildId)) {
        this.replies.set(guildId, new Map());
      }

      const existingIds = new Set(this.replies.get(guildId).keys());
      const newUniqueId = generateUniqueId(existingIds);

      this.replies.get(guildId).set(newUniqueId, { keyword, response });

      db.prepare(
        "INSERT INTO replies (guildId, uniqueId, keyword, response) VALUES (?, ?, ?, ?) ON CONFLICT(uniqueId) DO UPDATE SET keyword = excluded.keyword, response = excluded.response"
      ).run(guildId, newUniqueId, keyword, response);

      return newUniqueId;
    } catch (error) {
      console.log("新增回覆失敗", error.message);
    }
  },

  // 刪除回覆
  deleteReply(guildId, uniqueId) {
    if (this.replies.has(guildId)) {
      this.replies.get(guildId).delete(uniqueId);
      db.prepare("DELETE FROM replies WHERE uniqueId = ?").run(uniqueId);
    }
  },

  // 取得某個群組的所有回覆
  getRepliesByGuild(guildId) {
    if (!this.replies.has(guildId)) return null;
    return this.replies.get(guildId);
  },
};

export default RepliesManager;
