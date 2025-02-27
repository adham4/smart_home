const Device = require('../models/device.model');

exports.getAllDevices = async (req, res) => {
    try {
        const devices = await Device.findAll();
        res.json(devices);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getDeviceById = async (req, res) => {
    try {
        const { id } = req.params;
        const device = await Device.findByPk(id);
        if (!device) {
            return res.status(404).json({ error: 'Device not found' });
        }
        res.json(device);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createDevice = async (req, res) => {
    try {
        const { name, status, roomId } = req.body;
        const newDevice = await Device.create({ name, status, roomId });
        res.status(201).json(newDevice);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateDevice = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, status, roomId } = req.body;
        const device = await Device.findByPk(id);
        if (!device) {
            return res.status(404).json({ error: 'Device not found' });
        }
        await device.update({ name, status, roomId });
        res.json(device);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteDevice = async (req, res) => {
    try {
        const { id } = req.params;
        const device = await Device.findByPk(id);
        if (!device) {
            return res.status(404).json({ error: 'Device not found' });
        }
        await device.destroy();
        res.json({ message: 'Device deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};