const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Room = require('./room.model');

const Device = sequelize.define('Device', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.ENUM('sensor', 'controller'), allowNull: false },
    room_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: Room, key: 'id' } },
    status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    timestamps: false,
    tableName: 'Devices'
});

module.exports = Device;