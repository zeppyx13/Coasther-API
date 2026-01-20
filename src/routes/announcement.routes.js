const express = require("express");
const router = express.Router();

const announcementController = require("../controllers/announcement.controller");

router.get("/", announcementController.list);

module.exports = router;
