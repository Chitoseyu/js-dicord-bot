import { defineStore } from "pinia";

export const useAppStore = defineStore("app", {
  state: () => ({
    client: null,
    commandsActionMap: null,
    replies: new Map(),
  }),
  getters: {},
  actions: {
    // 載入回覆
    loadReplies(guildId = null) {
      try {
        let rows;
        if (guildId) {
          rows = global.db
            .prepare("SELECT * FROM replies WHERE guildId = ?")
            .all(guildId);
          this.replies.set(guildId, new Map()); // 只清除特定 guild 的回應
        } else {
          rows = global.db.prepare("SELECT * FROM replies").all();
          this.replies.clear(); // 只有在完全載入時清空
        }

        for (const row of rows) {
          if (!this.replies.has(row.guildId)) {
            this.replies.set(row.guildId, new Map());
          }
          this.replies.get(row.guildId).set(row.uniqueId, {
            keyword: row.keyword,
            response: row.response,
          });
        }
        // console.log("✅ Replies loaded from SQLite.");
      } catch (error) {
        console.error("❌ Error loading replies:", error);
      }
    },
  },
});
