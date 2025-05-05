const User = require("./user.model");
const Device = require("./device.model");
const SensorsData = require("./sensorsData.model");
const Room = require("./room.model");
const Log = require("./log.model");

Room.hasMany(Device, { foreignKey: "room_id" });
Device.belongsTo(Room, { foreignKey: "room_id" });

Device.hasMany(SensorsData, { foreignKey: "device_id" });
SensorsData.belongsTo(Device, { foreignKey: "device_id" });

module.exports = {
  User,
  Device,
  SensorsData,
  Room,
  Log,
};
