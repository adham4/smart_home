// const User = require("./models/user.model");

// async function createAdhamUser() {
//   try {
//     const [user, created] = await User.findOrCreate({
//       where: { username: "adham" },
//       defaults: {
//         password: "adham",
//         role: "user"
//       }
//     });

//     if (created) {
//       console.log("✅ User 'adham' created.");
//     } else {
//       console.log("ℹ️ User 'adham' already exists.");
//     }
//   } catch (err) {
//     console.error("❌ Error creating 'adham' user:", err);
//   }
// }

// createAdhamUser();