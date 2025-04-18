import os
from flask import Flask, request
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes

# 定义 /start 命令的处理函数
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text("Hello! I'm your bot.")

# 创建 Flask 应用实例 (全局变量)
app = Flask(__name__)

# 主函数
if __name__ == "__main__":
    BOT_TOKEN = os.getenv("BOT_TOKEN")
    if not BOT_TOKEN:
        raise ValueError("Bot Token is not set in environment variables")

    # 创建 Telegram 应用实例
    application = ApplicationBuilder().token(BOT_TOKEN).updater(None).build()
    application.add_handler(CommandHandler("start", start))

    # 设置 Webhook
    WEBHOOK_URL = os.getenv("RENDER_EXTERNAL_URL")
    if not WEBHOOK_URL:
        raise ValueError("Webhook URL is not set in environment variables")

    import asyncio
    asyncio.run(application.bot.set_webhook(WEBHOOK_URL))

    @app.route("/", methods=["POST"])
    def webhook():
        update = Update.de_json(request.get_json(force=True), application.bot)
        application.process_update(update)
        return "OK"

    # 启动 Flask 应用
    app.run(host="0.0.0.0", port=5000)
