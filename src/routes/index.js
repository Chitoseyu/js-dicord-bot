import express from "express";

const router = express.Router();

// 初始路由
router.get("/", (req, res) => {
  const client = req.client;

  try {
    if (!client) {
      return res.status(500).send("<h1>Client 未初始化</h1>");
    }

    const status = client.isReady() ? "Online" : "Offline";
    const botUsername = client.user?.tag || "未登入";
    const guildCount = client.guilds.cache.size || 0;
    const botAvatar = client.user.displayAvatarURL() || 0;

    // 生成 HTML
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="zh-Hant">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bot 資訊</title>
        <link rel="icon" href="https://i.imgur.com/5gXfAdD.png" type="image/x-icon">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }
          .container {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            text-align: left;
          }
          .avatar-container {
            display: flex;
            justify-content: center; 
            align-items: center;     
            margin-bottom: 10px;    
          }  
          .bot_avatar {
            width: 150px;          
            height: 150px;           
            border-radius: 50%;      
            border: 3px solid #000000;
            object-fit: cover;      
          }
          h1 {
            color: ${status === "Online" ? "green" : "red"};
          }
          p {
            margin: 5px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="avatar-container">
            <img src="${botAvatar}" alt="Bot Avatar" class="bot_avatar">
          </div>
          <h1>名稱：${botUsername}</h1>
          <h1>狀態：${status}</h1>
          <h1>在 ${guildCount} 個伺服器上線</h1>
        </div>
      </body>
      </html>
    `;

    res.send(htmlContent);
  } catch (error) {
    console.error("Error in /status endpoint:", error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html lang="zh-Hant">
      <head>
        <meta charset="UTF-8">
        <title>錯誤</title>
      </head>
      <body>
        <h1>伺服器錯誤</h1>
        <p>${error.message}</p>
      </body>
      </html>
    `);
  }
});

export default router;
