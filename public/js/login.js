document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");

  const API_BASE_URL = "http://localhost:3000/api";

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success && data.token) {
        console.log("🟢 تسجيل الدخول ناجح! تحويل تلقائي للـ Dashboard...");
        localStorage.setItem("token", data.token);
        window.location.href = "/dashboard.html";
      } else {
        console.error("❌ فشل تسجيل الدخول: " + data.message);
        alert("Invalid login!");
      }
    } catch (error) {
      console.error("❌ خطأ أثناء تسجيل الدخول:", error);
      alert("Something went wrong. Try again.");
    }
  });
});