import Database from "better-sqlite3";

export async function initDatabase() {
  const db = new Database("./database.sqlite");

  // 建立提醒任務表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      channelId TEXT NOT NULL,
      time TEXT NOT NULL,
      message TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  // 建立自訂回應表
  db.exec(`
    CREATE TABLE IF NOT EXISTS replies (
      guildId TEXT NOT NULL,
      uniqueId TEXT PRIMARY KEY,
      keyword TEXT NOT NULL,
      response TEXT NOT NULL
    )
  `);
  // 建立群組設定表
  db.exec(`
    CREATE TABLE IF NOT EXISTS server_settings  (
      guildId TEXT PRIMARY KEY,
      enabled INTEGER NOT NULL DEFAULT 0,
      joinMessage TEXT DEFAULT '',
      leaveMessage TEXT DEFAULT ''
    )
  `);

  // console.log("✅ SQLite 資料庫已初始化");
  return db;
}
