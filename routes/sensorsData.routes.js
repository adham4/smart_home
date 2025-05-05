const express = require('express');
const router = express.Router();
const SensorsDataController = require('../controllers/sensorsData.controller');

router.get('/', SensorsDataController.getSensorsData);

router.get('/:id', SensorsDataController.getSensorsDataById);

router.post('/', SensorsDataController.createSensorsData);

router.put('/:id', SensorsDataController.updateSensorsData);

router.delete('/:id', SensorsDataController.deleteSensorsData);

router.get('/sensors/latest', SensorsDataController.getLatestSensorsData);

router.post('/device/control', SensorsDataController.controlDevice);

router.post('/sensorsData', SensorsDataController.createSensorsData);

module.exports = router;