const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SensorLog = sequelize.define("SensorLog", {
  sensor_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  value: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = SensorLog;