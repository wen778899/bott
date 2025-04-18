from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes

# 定义 /start 命令的处理函数
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text("Hello! I'm your bot.")

# 主函数
if __name__ == "__main__":
    # 替换为你的 Telegram Bot Token
    BOT_TOKEN = "YOUR_TELEGRAM_BOT_TOKEN"

    # 创建应用程序实例
    application = ApplicationBuilder().token(BOT_TOKEN).build()

    # 添加命令处理器
    application.add_handler(CommandHandler("start", start))

    # 启动机器人
    application.run_polling()
