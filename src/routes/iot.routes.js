const express = require("express");
const router = express.Router();

const iotAuth = require("../middlewares/iotAuth.middleware");
const iotController = require("../controllers/iot.controller");

// public tapi pakai device auth
router.post("/meter-reading", iotAuth, iotController.meterReading);

module.exports = router;
