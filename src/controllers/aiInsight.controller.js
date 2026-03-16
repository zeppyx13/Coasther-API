const { ok, fail } = require("../utils/response");
const aiInsightService = require("../services/aiInsight.service");

async function getRoomInsight(req, res) {
  try {
    const roomId = Number(req.params.roomId);
    const days = req.query.days ? Number(req.query.days) : 30;

    const result = await aiInsightService.generateRoomInsight({
      roomId,
      days,
    });

    return ok(res, result, "AI insight generated");
  } catch (err) {
    return fail(res, err.message, err.statusCode || 500);
  }
}

module.exports = {
  getRoomInsight,
};
