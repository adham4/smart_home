// server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const nocache = require("nocache");
const bcrypt = require("bcrypt");

const app = express();
const sequelize = require("./config/database");
const User = require("./models/user.model");

app.use(
  cors({
    origin: ["http://localhost:3000", "https://smart-home-ecru.vercel.app"],
    methods: ["GET", "POST"],
  })
);

const SensorLog = require("./models/sensorLog.model");

app.use(nocache());

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", require("./routes/user.routes"));
app.use("/api/devices", require("./routes/device.routes"));
app.use("/api/sensors-data", require("./routes/sensorsData.routes"));
app.use("/api/rooms", require("./routes/room.routes"));
app.use("/api/logs", require("./routes/log.routes"));

sequelize
sequelize.sync()
.then(() => {
    console.log("✅ All models were synchronized successfully.");
  })
  .catch((error) => {
    console.error("❌ Error synchronizing models:", error);
  });

app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
  console.log("🔥 Serving public/index.html");
});

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

app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});
