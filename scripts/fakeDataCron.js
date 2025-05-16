// scripts/fakeDataCron.js
const axios = require("axios");

setInterval(async () => {
  try {
    await axios.get("http://localhost:3000/api/sensors-data");
    console.log("✅ تم استدعاء البيانات وتسجيلها");
  } catch (err) {
    console.error("❌ فشل الاستدعاء:", err.message);
  }
}, 10 * 1000); 