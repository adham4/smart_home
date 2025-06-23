const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Device = require("./device.model");

const SensorsData = sequelize.define(
  "SensorsData",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    device_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    data_type: { type: DataTypes.STRING, allowNull: false },
    value: { type: DataTypes.FLOAT, allowNull: false },
    recorded_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    timestamps: true,
    tableName: "SensorsData",
  }
);

module.exports = SensorsData;
