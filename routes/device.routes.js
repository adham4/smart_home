const express = require('express');
const router = express.Router();
const DeviceController = require('../controllers/device.controller');

router.get('/', DeviceController.getAllDevices);

router.get('/:id', DeviceController.getDeviceById);

router.post('/', DeviceController.createDevice);

router.put('/:id', DeviceController.updateDevice);

router.delete('/:id', DeviceController.deleteDevice);

module.exports = router;