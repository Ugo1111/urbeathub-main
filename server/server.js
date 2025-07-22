const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const BOT_TOKEN = "7831671379:AAEgkMTbrECnJEnzpz25VwsvvUYW610CSOE";
const CHAT_ID = "-1002572086216";

app.post("/notify-telegram", async (req, res) => {
  const {
    event,
    details,
    browser,
    ip,
    city,
    country,
    isReturning,
    trafficSource,
    utm
  } = req.body;

  try {
    let message = "";

    // 🔍 Full session log
    if (event && details?.activities) {
      message = `📢 *${event}*\n\n📝 *Activity Timeline:*\n`;

      details.activities.forEach((act, i) => {
        let logLine = `${i + 1}. • *${act.event}*: `;
        const d = act.details;

        switch (act.event) {
          case "Audio Play":
            logLine += `🎶 Played "${d.trackName}"`;
            break;
          case "Audio Pause/End":
            logLine += `⏸️ Stopped "${d.trackName}" after ${d.playedFor}`;
            break;
          case "Payment":
            const emoji =
              d.status === "Success"
                ? "✅"
                : d.status === "Failed"
                ? "❌"
                : d.status === "Canceled"
                ? "🚫"
                : "⚠️";
            logLine += `💳 ${emoji} ${d.status} payment for "${d.beatTitle}" – ₦${d.amount} (Ref: ${d.reference})`;
            break;
          case "Sign In":
            logLine += `🔑 Signed in as ${d.email}`;
            break;
          case "Sign Out":
            logLine += `🔒 Signed out (${d.email})`;
            break;
          case "File Upload":
            logLine += `📤 Uploaded "${d.filename}" (${d.fileSize}, ${d.contentType})`;
            break;
          case "Click":
            logLine += `🖱️ Clicked ${d.element}: "${d.text}"`;
            break;
          case "Page Exit":
            logLine += `🚪 Left page after ${d.timeSpent}`;
            break;
          default:
            logLine += JSON.stringify(d);
        }

        message += logLine + "\n";
      });

    // 🌍 Visitor info only
    } else if (browser && ip && city && country) {
      const visitorType = isReturning ? "🔁 Returning Visitor" : "🆕 New Visitor";
      const utmText =
        utm && (utm.source || utm.medium || utm.campaign)
          ? `📌 UTM: ${utm.source || "-"} / ${utm.medium || "-"} / ${utm.campaign || "-"}`
          : "📌 UTM: Not available";

      message = `${visitorType} Alert!
🌍 Location: ${city}, ${country}
🖥️ Browser: ${browser}
🌐 IP: ${ip}
🔗 Traffic Source: ${trafficSource}
${utmText}`;

    // 🛠️ Fallback
    } else {
      message = `📩 Raw Data:\n${JSON.stringify(req.body, null, 2)}`;
    }

    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: message,
      parse_mode: "Markdown",
    });

    res.status(200).send("✅ Notification sent");
  } catch (error) {
    console.error("❌ Telegram error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to send Telegram message" });
  }
});

// 🔄 Health check
app.get("/test", (req, res) => {
  res.send("✅ Server is running");
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
