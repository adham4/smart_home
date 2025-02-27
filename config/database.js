const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('smart_home_db', 'smart_home', 'Adham@123', {
    host: 'localhost',
    dialect: 'mysql', 
    logging: false,
});

sequelize.authenticate()
    .then(() => console.log('✅ Connected to the database successfully!'))
    .catch((error) => console.error('❌ Unable to connect to the database:', error));

module.exports = sequelize;