module.exports = {
  apps: [
    {
      name: "liv-helper", // PM2 名稱
      script: "node",
      args: "node_modules/vite-node/vite-node.mjs src/main.js",
      exec_mode: "fork",
      autorestart: true, // 程式崩潰自動重啟
      watch: false, // 監聽檔案變動
      max_memory_restart: "500M", // 記憶體超過時重啟
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
