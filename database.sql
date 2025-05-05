const express = require("express");
const app = express();
const { sequelize } = require("./models");

app.use(express.json());

sequelize.sync().then(() => {
  console.log("Database & tables created!");

  // إنشاء مستخدم admin تلقائي إذا لم يكن موجودًا
  const User = require("./models/User");

  User.findOrCreate({
    where: { username: "admin" },
    defaults: {
      password: "1234", // يُفضل تشفيره لاحقًا
      role: "admin",
    }
  }).then(([user, created]) => {
    if (created) {
      console.log("✅ Admin user created.");
    } else {
      console.log("ℹ️ Admin user already exists.");
    }
  }).catch(err => {
    console.error("❌ Error creating admin user:", err);
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
