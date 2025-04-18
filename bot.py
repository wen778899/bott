from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes

# 定义 /start 命令的处理函数
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text("Hello! I'm your bot.")

# 主函数
if __name__ == "__main__":
    import os
    from flask import Flask, request

    BOT_TOKEN = os.getenv("BOT_TOKEN")
    WEBHOOK_URL = os.getenv("RENDER_EXTERNAL_URL")  # Render 提供的 URL

    application = ApplicationBuilder().token(BOT_TOKEN).updater(None).build()
    application.add_handler(CommandHandler("start", start))

    # 启用 Webhook
    application.bot.set_webhook(WEBHOOK_URL)

    # 创建 Flask 应用
    app = Flask(__name__)

    @app.route("/", methods=["POST"])
    def webhook():
        update = Update.de_json(request.get_json(force=True), application.bot)
        application.process_update(update)
        return "OK"

    app.run(host="0.0.0.0", port=5000)
