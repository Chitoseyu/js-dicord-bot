import fs from "fs";

export function getLogFileName(commandName) {
  const logDir = `./src/logs/${commandName}`;
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const currentDate = new Date()
    .toLocaleDateString("zh-TW", {
      timeZone: "Asia/Taipei",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\//g, "-");

  return `${logDir}/${currentDate}.log`;
}
export const getTaipeiTime = () => {
  const now = new Date();
  return now.toLocaleString("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};
export const logAction = (
  type,
  commandName,
  guildName,
  userName,
  nickname,
  content
) => {
  const now = getTaipeiTime();
  const logMessage = `【${now}】 [${type}] 群組：${guildName} | 用戶：${userName} | 群名片：${nickname} | 操作：${content}\n`;

  const logFileName = getLogFileName(commandName);
  fs.appendFileSync(logFileName, logMessage);
};
