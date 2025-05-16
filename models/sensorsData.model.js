const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Device = require('./device.model');

const SensorsData = sequelize.define('SensorsData', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    device_id: { type: DataTypes.STRING, allowNull: false /* ,references: { model: Device, key: 'id' }*/ },
    data_type: { type: DataTypes.STRING, allowNull: false },
    value: { type: DataTypes.FLOAT, allowNull: false },
    recorded_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    timestamps: false,
    tableName: 'SensorsData'
});

module.exports = SensorsData;