const { ok, fail } = require("../utils/response");
const announcementService = require("../services/announcement.service");
const {
  listAnnouncementsQuerySchema,
} = require("../validators/announcement.validator");

async function list(req, res) {
  try {
    const query = listAnnouncementsQuerySchema.parse(req.query);
    const result = await announcementService.listAnnouncements(query);
    return ok(res, result, "OK", 200);
  } catch (err) {
    return fail(res, err.message, err.statusCode || 400);
  }
}

module.exports = { list };
