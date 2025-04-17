const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const yaml = require('js-yaml');
const QRCode = require('qrcode');
const fs = require('fs');
const ping = require('ping');

const TOKEN = process.env.BOT_TOKEN;
const bot = new TelegramBot(TOKEN); // 创建 Telegram Bot 实例

const app = express();
app.use(express.json());

// Telegram Webhook
app.post(`/bot${TOKEN}`, (req, res) => {
  const update = req.body;
  bot.processUpdate(update);
  res.sendStatus(200);
});

// 订阅转换功能
bot.onText(/\/convert (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const subscriptionUrl = match[1];

  try {
    const response = await axios.get(subscriptionUrl);
    const content = response.data;

    if (content.startsWith('proxies:')) {
      const parsedConfig = yaml.load(content);
      bot.sendMessage(chatId, '已解析为 Clash 配置:\n' + JSON.stringify(parsedConfig, null, 2));
    } else {
      const decodedConfig = Buffer.from(content, 'base64').toString('utf-8');
      bot.sendMessage(chatId, '已解析为 V2Ray 配置:\n' + decodedConfig);
    }
  } catch (error) {
    bot.sendMessage(chatId, '解析失败，请检查订阅链接或内容格式。');
  }
});

// 节点测速功能
bot.onText(/\/speedtest (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const subscriptionUrl = match[1];

  try {
    const response = await axios.get(subscriptionUrl);
    const content = yaml.load(response.data);

    const nodes = content.proxies.map(proxy => proxy.server); // 提取节点
    const results = [];

    for (const node of nodes) {
      const result = await ping.promise.probe(node);
      results.push({ server: node, time: result.time });
    }

    results.sort((a, b) => a.time - b.time);
    let message = '测速结果:\n';
    results.forEach(r => (message += `${r.server}: ${r.time} ms\n`));

    bot.sendMessage(chatId, message);
  } catch (error) {
    bot.sendMessage(chatId, '测速失败，请检查订阅链接或内容格式。');
  }
});

// 节点筛选功能
bot.onText(/\/filter (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const filters = match[1];

  try {
    const response = await axios.get('<subscription_url>');
    const content = yaml.load(response.data);

    const filteredNodes = content.proxies.filter(proxy => proxy.name.includes(filters));
    bot.sendMessage(chatId, `筛选结果:\n${JSON.stringify(filteredNodes, null, 2)}`);
  } catch (error) {
    bot.sendMessage(chatId, '筛选失败，请检查订阅内容格式。');
  }
});

// 生成节点二维码功能
bot.onText(/\/qrcode (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const subscriptionUrl = match[1];

  try {
    const response = await axios.get(subscriptionUrl);
    const content = yaml.load(response.data);

    content.proxies.forEach(async (proxy) => {
      const nodeLink = `vmess://${Buffer.from(JSON.stringify(proxy)).toString('base64')}`;
      const qrCodeDataUrl = await QRCode.toDataURL(nodeLink);

      bot.sendPhoto(chatId, qrCodeDataUrl, { caption: `节点: ${proxy.name}` });
    });
  } catch (error) {
    bot.sendMessage(chatId, '生成二维码失败，请检查订阅内容格式。');
  }
});

// 备份订阅功能
bot.onText(/\/backup (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const subscriptionUrl = match[1];

  axios.get(subscriptionUrl).then(response => {
    const filePath = `backups/${chatId}_backup.yaml`;
    fs.writeFileSync(filePath, response.data);
    bot.sendMessage(chatId, '订阅已备份！');
  }).catch(() => {
    bot.sendMessage(chatId, '备份失败，请检查订阅链接。');
  });
});

bot.onText(/\/restore/, (msg) => {
  const chatId = msg.chat.id;
  const filePath = `backups/${chatId}_backup.yaml`;

  if (fs.existsSync(filePath)) {
    bot.sendDocument(chatId, filePath);
  } else {
    bot.sendMessage(chatId, '没有找到您的备份记录！');
  }
});

// 启动 Express 应用
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Telegram Bot running on port ${PORT}`);
});
