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
