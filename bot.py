import os
from flask import Flask, request
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes

# 定义 /start 命令的处理函数
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text("Hello! I'm your bot and I'm running!")

# 定义异步函数，用于设置 Webhook
async def setup_webhook(application):
    webhook_url = os.getenv("RENDER_EXTERNAL_URL")  # Render 提供的公开 URL
    if not webhook_url:
        raise ValueError("RENDER_EXTERNAL_URL is not set in environment variables")
    await application.bot.set_webhook(webhook_url)

# 创建 Flask 应用
app = Flask(__name__)

@app.route("/", methods=["GET", "HEAD"])
def index():
    """处理健康检查请求"""
    return "Bot is running", 200

@app.route(f"/bot{os.getenv('BOT_TOKEN')}", methods=["POST"])
def webhook():
    """处理 Telegram 的 Webhook 请求"""
    update = Update.de_json(request.get_json(force=True), application.bot)
    application.process_update(update)
    return "OK", 200

# 主程序入口
if __name__ == "__main__":
    # 从环境变量中读取 Telegram Bot Token
    bot_token = os.getenv("BOT_TOKEN")
    if not bot_token:
        raise ValueError("BOT_TOKEN is not set in environment variables")

    # 创建 Telegram 应用实例
    application = ApplicationBuilder().token(bot_token).updater(None).build()
    application.add_handler(CommandHandler("start", start))

    # 设置 Webhook
    import asyncio
    asyncio.run(setup_webhook(application))

    # 启动 Flask 应用
    app.run(host="0.0.0.0", port=5000)
