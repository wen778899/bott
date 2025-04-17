const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const yaml = require('js-yaml');
const QRCode = require('qrcode');
const fs = require('fs');
const ping = require('ping');
const HttpsProxyAgent = require('https-proxy-agent');

// 环境变量设置
const TOKEN = process.env.BOT_TOKEN; // Telegram Bot Token
const PROXY_URL = process.env.PROXY_URL || ''; // 代理 URL（如有需要）
const PORT = process.env.PORT || 3000; // 服务器端口

// 创建 Express 应用
const app = express();
app.use(express.json());

// 创建 Telegram Bot 实例
const botOptions = PROXY_URL
  ? { webHook: true, request: { agent: new HttpsProxyAgent(PROXY_URL) } }
  : { webHook: true };
const bot = new TelegramBot(TOKEN, botOptions);

// 设置 Webhook
const WEBHOOK_URL = `https://bott-ynv4.onrender.com/bot${TOKEN}`;
bot.setWebHook(WEBHOOK_URL);

// 测试根路由
app.get('/', (req, res) => res.send('Telegram Bot is running...'));

// Telegram Webhook 路由
app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// 功能 1: Clash/V2Ray 节点订阅转换
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

// 功能 2: 节点测速
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

// 功能 3: 节点筛选
bot.onText(/\/filter (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const filterKey = match[1];

  try {
    const response = await axios.get('<subscription_url>');
    const content = yaml.load(response.data);

    const filteredNodes = content.proxies.filter(proxy => proxy.name.includes(filterKey));
    bot.sendMessage(chatId, `筛选结果:\n${JSON.stringify(filteredNodes, null, 2)}`);
  } catch (error) {
    bot.sendMessage(chatId, '筛选失败，请检查订阅内容格式。');
  }
});

// 功能 4: 生成节点二维码
bot.onText(/\/qrcode (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const subscriptionUrl = match[1];

  try {
    const response = await axios.get(subscriptionUrl);
    const content = yaml.load(response.data);

    for (const proxy of content.proxies) {
      const nodeLink = `vmess://${Buffer.from(JSON.stringify(proxy)).toString('base64')}`;
      const qrCodeDataUrl = await QRCode.toDataURL(nodeLink);

      bot.sendPhoto(chatId, qrCodeDataUrl, { caption: `节点: ${proxy.name}` });
    }
  } catch (error) {
    bot.sendMessage(chatId, '生成二维码失败，请检查订阅内容格式。');
  }
});

// 功能 5: 订阅备份
bot.onText(/\/backup (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const subscriptionUrl = match[1];

  try {
    const response = await axios.get(subscriptionUrl);
    const filePath = `backups/${chatId}_backup.yaml`;
    fs.writeFileSync(filePath, response.data);
    bot.sendMessage(chatId, '订阅已备份！');
  } catch (error) {
    bot.sendMessage(chatId, '备份失败，请检查订阅链接。');
  }
});

// 功能 6: 恢复备份
bot.onText(/\/restore/, (msg) => {
  const chatId = msg.chat.id;
  const filePath = `backups/${chatId}_backup.yaml`;

  if (fs.existsSync(filePath)) {
    bot.sendDocument(chatId, filePath);
  } else {
    bot.sendMessage(chatId, '没有找到您的备份记录！');
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Telegram Bot running on port ${PORT}`);
});
