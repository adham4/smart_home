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
        const { sensorType, value, timestamp } = req.body;
        const newData = await SensorsData.create({ sensorType, value, timestamp });
        res.status(201).json(newData);
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