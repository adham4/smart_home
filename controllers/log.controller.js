const Log = require('../models/log.model');

exports.getAllLogs = async (req, res) => {
    try {
        const logs = await Log.findAll();
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// عرض سجل معين
exports.getLogById = async (req, res) => {
    try {
        const { id } = req.params;
        const log = await Log.findByPk(id);
        if (!log) {
            return res.status(404).json({ error: 'Log not found' });
        }
        res.json(log);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createLog = async (req, res) => {
    try {
        const { message, level } = req.body;
        const newLog = await Log.create({ message, level });
        res.status(201).json(newLog);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteLog = async (req, res) => {
    try {
        const { id } = req.params;
        const log = await Log.findByPk(id);
        if (!log) {
            return res.status(404).json({ error: 'Log not found' });
        }
        await log.destroy();
        res.json({ message: 'Log deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};