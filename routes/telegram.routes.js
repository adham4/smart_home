const express = require("express");
const axios = require("axios");
const router = express.Router();

const sendTelegramAlert = async (message) => {
  const token = "7754093447:AAEvJ3oWSPMOJ8kRhHAE0A2naGEllV39tmo";
  const chatId = "1048932090";
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    await axios.post(url, {
      chat_id: chatId,
      text: message,
    });
    console.log("✅ Telegram alert sent.");
  } catch (err) {
    console.error("❌ Failed to send Telegram alert:", err.message);
  }
};

// نقطة نهاية جديدة لاستقبال التنبيهات من الداشبورد

router.post("/api/alerts", async (req, res) => {
  const { type, value } = req.body;
  if (!type || value === undefined) {
    return res.status(400).json({ error: "Invalid alert payload" });
  }
  try {
    let message = "";
    if (type === "gas" && value > 400) {
      message = `⚠️ ارتفاع نسبة الغاز!`;
    } else if (type === "fire" && value < 3000) {
      message = `🔥 تم رصد حريق !`;
    } else {
      return res.status(200).json({ message: "No alert needed." });
    }
    await sendTelegramAlert(message);
    res.status(200).json({ message: "Alert sent successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
