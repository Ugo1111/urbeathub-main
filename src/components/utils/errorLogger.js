export const logErrorToTelegram = async (error, context = "General") => {
  const BOT_TOKEN = process.env.REACT_APP_TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.REACT_APP_TELEGRAM_CHAT_ID;
  
  // Detect the page where the error happened
  const page = typeof window !== "undefined" ? window.location.pathname : "Unknown";

  const message = `
⚠️ Error in Beatstore
Context: ${context}
Page: ${page}
Error: ${error?.message || error}
Time: ${new Date().toLocaleString()}
`;

  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message.trim(),
      }),
    });
  } catch (err) {
    console.error("Failed to send error to Telegram:", err);
  }
};
