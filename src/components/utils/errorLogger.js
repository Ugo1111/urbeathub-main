export const logErrorToTelegram = async (error, context = "General") => {
  const BOT_TOKEN = "7831671379:AAEgkMTbrECnJEnzpz25VwsvvUYW610CSOE";
  const CHAT_ID = "-1002572086216";

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
