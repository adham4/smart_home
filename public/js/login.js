document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                console.log('🟢 تسجيل الدخول ناجح! تحويل تلقائي للـ Dashboard...');
                window.location.href = '/dashboard.html';
                console.log('➡️ جاري التحويل...');
            } else {
                console.error('❌ فشل تسجيل الدخول: ' + data.message);
            }
        } catch (error) {
            console.error('❌ خطأ أثناء تسجيل الدخول:', error);
        }
    });
});