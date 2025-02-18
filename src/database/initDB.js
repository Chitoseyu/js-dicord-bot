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

  console.log("✅ SQLite 資料庫已初始化");
  return db;
}
