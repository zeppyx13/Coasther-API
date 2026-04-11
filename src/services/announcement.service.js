const announcementModel = require("../models/announcement.model");

function httpError(message, statusCode = 400) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

async function listAnnouncements(query) {
  const result = await announcementModel.findAll(query);
  return {
    announcements: result.rows,
    meta: { total: result.total, page: result.page, limit: result.limit },
  };
}

async function getAnnouncementDetail(id) {
  const announcement = await announcementModel.findById(id);
  if (!announcement) throw httpError("Announcement not found", 404);
  return { announcement };
}

async function createAnnouncement(payload) {
  const id = await announcementModel.create(payload);
  return getAnnouncementDetail(id);
}

async function updateAnnouncement(id, payload) {
  const existing = await announcementModel.findById(id);
  if (!existing) throw httpError("Announcement not found", 404);
  await announcementModel.updateById(id, payload);
  return getAnnouncementDetail(id);
}

async function deleteAnnouncement(id) {
  const existing = await announcementModel.findById(id);
  if (!existing) throw httpError("Announcement not found", 404);
  await announcementModel.deleteById(id);
  return { deleted: true };
}

module.exports = {
  listAnnouncements,
  getAnnouncementDetail,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
