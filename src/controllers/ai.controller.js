const { ok, fail } = require("../utils/response");
const aiService = require("../services/ai.service");

async function getRoomInsight(req, res) {
  try {
    const roomId = Number(req.params.roomId);
    const days = Number(req.query.days) || 30;
    const forceRefresh = req.query.refresh === "true";
    const result = await aiService.generateRoomInsight({
      roomId,
      days,
      forceRefresh,
    });
    return ok(res, result, "OK", 200);
  } catch (err) {
    return fail(res, err.message, err.statusCode || 500);
  }
}

async function getRoomPrediction(req, res) {
  try {
    const roomId = Number(req.params.roomId);
    const forceRefresh = req.query.refresh === "true";
    const result = await aiService.generateRoomPrediction({
      roomId,
      forceRefresh,
    });
    return ok(res, result, "OK", 200);
  } catch (err) {
    return fail(res, err.message, err.statusCode || 500);
  }
}

module.exports = { getRoomInsight, getRoomPrediction };
