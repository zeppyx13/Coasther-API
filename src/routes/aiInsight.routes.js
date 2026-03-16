const express = require("express");
const router = express.Router();

const aiInsightController = require("../controllers/aiInsight.controller");

router.get("/rooms/:roomId", aiInsightController.getRoomInsight);
// GET /api/ai-insights/rooms/1?days=30
module.exports = router;
