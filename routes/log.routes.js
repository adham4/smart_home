const express = require('express');
const router = express.Router();
const LogController = require('../controllers/log.controller');

router.get('/', LogController.getAllLogs);

router.get('/:id', LogController.getLogById);

router.post('/', LogController.createLog);

router.delete('/:id', LogController.deleteLog);

module.exports = router;