import { defineStore } from "pinia";
import fs from "fs";

export const useAppStore = defineStore("app", {
  state: () => ({
    client: null,
    commandsActionMap: null,
    replies: new Map(),
  }),
  getters: {},
  actions: {
    loadReplies() {
      try {
        if (fs.existsSync("./replies.json")) {
          const data = JSON.parse(fs.readFileSync("./replies.json"));
          if (data) {
            this.replies = new Map(
              Object.entries(data).map(([guildId, keywords]) => [
                guildId,
                new Map(Object.entries(keywords)),
              ])
            );
          }
        } else {
          console.log("No replies.json file found. Creating a new one...");
        }
      } catch (error) {
        console.error("Error loading replies:", error);
      }
    },
    saveReplies() {
      try {
        const data = Object.fromEntries(
          [...this.replies.entries()].map(([guildId, replies]) => [
            guildId,
            Object.fromEntries(
              [...replies.entries()].map(
                ([uniqueId, { keyword, response }]) => [
                  uniqueId,
                  { keyword, response },
                ]
              )
            ),
          ])
        );
        fs.writeFileSync("./replies.json", JSON.stringify(data, null, 2));
      } catch (error) {
        console.error("Error saving replies:", error);
      }
    },
  },
});
