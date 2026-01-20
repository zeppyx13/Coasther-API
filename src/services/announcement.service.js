const announcementModel = require("../models/announcement.model");

async function listAnnouncements(query) {
  const result = await announcementModel.findActiveAnnouncements(query);
  return {
    announcements: result.rows,
    meta: { total: result.total, page: result.page, limit: result.limit },
  };
}

module.exports = { listAnnouncements };
