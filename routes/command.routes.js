// routes/command.routes.js
const express = require("express");
const router = express.Router();
const commandController = require("../controllers/command.controller");

router.post("/", commandController.setCommands);

router.get("/", commandController.getCommands);

module.exports = router;