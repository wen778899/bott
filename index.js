const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

// 从环境变量获取 Bot Token
const TOKEN = process.env.BOT_TOKEN;
const bot = new TelegramBot(TOKEN);

// 使用 Express 设置 Webhook
const app = express();
app.use(express.json()); // 解析 JSON 请求体

// Telegram Webhook 路径
app.post(`/bot${TOKEN}`, (req, res) => {
  const update = req.body;
  bot.processUpdate(update); // 处理 Telegram 更新
  res.sendStatus(200);
});

// 设置一个简单的指令处理
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, '欢迎使用 Telegram Bot！');
});

// 运行 Express 应用
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Telegram Bot running on port ${PORT}`);
});
