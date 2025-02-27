const express = require('express');
const path = require('path');
const app = express();
const sequelize = require('./config/database');
const models = require('./models');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', require('./routes/user.routes'));
app.use('/api/devices', require('./routes/device.routes'));
app.use('/api/sensors-data', require('./routes/sensorsData.routes'));
app.use('/api/rooms', require('./routes/room.routes'));
app.use('/api/logs', require('./routes/log.routes'));

sequelize.sync({ alter: true }).then(() => {
    console.log('✅ All models were synchronized successfully.');
}).catch((error) => {
    console.error('❌ Error synchronizing models:', error);
});
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    console.log('Received Username:', username);
    console.log('Received Password:', password);

    if (username === 'admin' && password === '1234') {
        console.log('✅ Login Successful');
        res.json({ success: true, message: 'Login successful!' });
    } else {
        console.log('❌ Invalid username or password');
        res.json({ success: false, message: 'Invalid username or password.' });
    }
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});