// controllers/command.controller.js
const axios = require("axios");

exports.setCommands = async (req, res) => {
  const { deviceId, action } = req.body;

  if (!deviceId || !action) {
    return res.status(400).json({ error: "deviceId and action are required" });
  }

  try {
    // هنا الـ IP بتاع الـ ESP32
    const esp32Url = `http://<ESP32_IP>/control?device=${deviceId}&action=${action}`;

    // ابعت الطلب للـ ESP32 مع توضيح الإجراء
    console.log(`🔄 Sending command to ESP32: Device ID = ${deviceId}, Action = ${action}`);

    const response = await axios.get(esp32Url);

    // استقبل النتيجة من الـ ESP32 وعرضها
    console.log(`✅ Received response from ESP32: ${response.data}`);

    res.json({
      message: `Command '${action}' sent to device '${deviceId}' successfully.`,
      esp32Response: response.data
    });
  } catch (err) {
    console.error("❌ Error sending command to ESP32:", err.message);
    res.status(500).json({ error: "Failed to send command to ESP32" });
  }
};

exports.getCommands = async (req, res) => {
  // هنا لو حابب تعرض أو ترجع أوامر محفوظة - أو أي حاجة تانية
  res.json({ message: "Get commands endpoint" });
};