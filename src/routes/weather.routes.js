const express = require("express");
const router = express.Router();
const weatherController = require("../controllers/weather.controller");

router.get("/current", weatherController.getCurrentWeather);

module.exports = router;
