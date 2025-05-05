const SensorsData = require('../models/sensorsData.model');

exports.getSensorsData = (req, res) => {
    const sensorsData = {
        temperature: (20 + Math.random() * 15).toFixed(1), 
        humidity: (30 + Math.random() * 70).toFixed(1), 
        light: Math.floor(Math.random() * 1000), 
        motion: Math.random() > 0.5, 
        gas: Math.floor(Math.random() * 500), 
        flame: Math.random() > 0.7, 
        rain: Math.random() > 0.8,
        door: Math.random() > 0.5 
    };
    
    res.json(sensorsData);
};
// هناخد البيانات الحفيقيه من هنا متمسحش حاجه
// exports.getAllSensorsData = async (req, res) => {
//     try {
//         const data = await SensorsData.findAll();
//         res.json(data);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

exports.getSensorsDataById = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await SensorsData.findByPk(id);
        if (!data) {
            return res.status(404).json({ error: 'Sensor data not found' });
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createSensorsData = async (req, res) => {
    try {
        const { device_id, readings } = req.body;

        if (!device_id || typeof readings !== 'object' || readings === null) {
            return res.status(400).json({ error: "Invalid payload. Expected device_id and readings object." });
        }

        const entries = Object.entries(readings);
        const createdEntries = [];
        const thresholds = {
            temperature: 30,  
            humidity: 70,  
            gas: 400,    
            light: 800,      
        };

        for (const [data_type, value] of entries) {
            if (thresholds[data_type] && value > thresholds[data_type]) {
                const newData = await SensorsData.create({ device_id, data_type, value });
                createdEntries.push(newData);
            }
        }

        res.status(201).json({
            message: "Sensor data recorded successfully.",
            data: createdEntries
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateSensorsData = async (req, res) => {
    try {
        const { id } = req.params;
        const { sensorType, value, timestamp } = req.body;
        const data = await SensorsData.findByPk(id);
        if (!data) {
            return res.status(404).json({ error: 'Sensor data not found' });
        }
        await data.update({ sensorType, value, timestamp });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteSensorsData = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await SensorsData.findByPk(id);
        if (!data) {
            return res.status(404).json({ error: 'Sensor data not found' });
        }
        await data.destroy();
        res.json({ message: 'Sensor data deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getLatestSensorsData = async (req, res) => {
    try {
        const { Op } = require('sequelize');
        const sensorTypes = ['temperature', 'humidity', 'light', 'motion', 'gas', 'flame', 'rain', 'door'];
        const latestData = {};

        for (const type of sensorTypes) {
            const data = await SensorsData.findOne({
                where: { data_type: type },
                order: [['createdAt', 'DESC']]
            });
            if (data) latestData[type] = data.value;
        }

        res.json(latestData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.controlDevice = (req, res) => {
    const { deviceId, action } = req.body;

    if (!deviceId || !['on', 'off'].includes(action)) {
        return res.status(400).json({ error: "Invalid payload. Required: deviceId and action (on/off)" });
    }

    console.log(`Device ${deviceId} set to ${action}`);

    res.json({ message: `Device ${deviceId} set to ${action}` });
};