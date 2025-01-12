import { defineStore } from "pinia";

export const useAppStore = defineStore("app", {
  state: () => ({
    client: null,
    commandsActionMap: null,
    replies: new Map([["liv", "Hi！"]]),
  }),
  getters: {},
  actions: {},
});
