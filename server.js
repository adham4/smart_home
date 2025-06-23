// server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const nocache = require("nocache");
const bcrypt = require("bcrypt");
const WebSocket = require("ws");  // 🟡 WebSocket Library

require("dotenv").config();

const app = express();
const sequelize = require("./config/database");
const User = require("./models/user.model");
const SensorLog = require("./models/sensorLog.model");

// 🟡 Middlewares
app.use(
  cors({
    origin: ["http://localhost:3000", "https://smarthome-five-rose.vercel.app"],
    methods: ["GET", "POST"],
  })
);

app.use(nocache());
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🟡 API Routes
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/devices", require("./routes/device.routes"));
app.use("/api/sensors-data", require("./routes/sensorsData.routes"));
app.use("/api/rooms", require("./routes/room.routes"));
app.use("/api/logs", require("./routes/log.routes"));
app.use("/api/commands", require("./routes/command.routes"));
app.use("/api/login", require("./routes/auth.routes"));
app.use("/", require("./routes/telegram.routes"));

// 🟡 Sequelize Sync
sequelize.sync()
  .then(() => {
    console.log("✅ All models were synchronized successfully.");
  })
  .catch((error) => {
    console.error("❌ Error synchronizing models:", error);
  });

// 🟡 Static Files
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
  console.log("🔥 Serving public/index.html");
});

// 🟡 Simple Login Check
let isLoggedIn = false;
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.json({ success: false, message: "User not found." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid password." });
    }
    res.json({ success: true, message: "Login successful!" });
  } catch (err) {
    console.error("❌ Error during login:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// 🟡 Sensor Logs Endpoint
app.post('/log-sensor', async (req, res) => {
  const { sensor_type, value } = req.body;
  console.log("Data received:", { sensor_type, value });
  try {
    await SensorLog.create({ sensor_type, value });
    res.send({ message: 'Logged successfully' });
  } catch (err) {
    console.error("❌ Error logging sensor data:", err);
    res.status(500).send({ message: "Logging failed" });
  }
});

// 🟡 Dashboard Access Control
function checkAuth(req, res, next) {
  if (isLoggedIn) {
    next();
  } else {
    res.redirect("/");
  }
}
app.get("/dashboard", checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// 🟡 Start Express Server
app.listen(3000, "0.0.0.0", () => {
  console.log("🚀 Server running at http://0.0.0.0:3000");
});


// ============================================
// ✅ WebSocket Server
// ============================================
// const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 }, () => {
  console.log("🟢 WebSocket Server running at ws://0.0.0.0:8080");
});

// 🟡 Handle WebSocket connections
wss.on("connection", (ws) => {
  console.log("🔗 New WebSocket client connected!");

  // Send a welcome message (اختياري)
  ws.send("👋 Hello from WebSocket Server!");

  // Handle incoming messages
  ws.on("message", (message) => {
    console.log("📩 Received from client:", message.toString());
  
    // هنا نوزع الرسالة على باقي العملاء فقط (بدون مرسل الرسالة نفسه)
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  

    // لو حابب تنفذ أوامر معينة بناءً على الرسائل
    // if (message.toString().includes("ac_on")) {
    //   console.log("🔥 AC ON command received!");
    // }
  });

  // Handle client disconnection
  ws.on("close", () => {
    console.log("❌ WebSocket client disconnected");
  });
});