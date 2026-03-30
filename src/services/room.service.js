const roomModel = require("../models/room.model");

function httpError(message, statusCode = 400) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

async function listRooms(query) {
  const result = await roomModel.findAll(query);
  return {
    rooms: result.rows,
    meta: { total: result.total, page: result.page, limit: result.limit },
  };
}
async function listRoomsWithFacilitiesAndReviewAgg(query) {
  const result = await roomModel.findRoomsWithFacilitiesAndReviewAgg(query);
  return {
    rooms: result.rooms,
    meta: result.meta,
  };
}

async function getRoomDetail(id) {
  const room = await roomModel.findById(id);
  if (!room) throw httpError("Room not found", 404);

  const facilities = await roomModel.findFacilitiesByRoomId(id);
  return { room: { ...room, facilities } };
}

async function createRoom(payload) {
  const roomId = await roomModel.createRoom(payload);

  if (payload.facility_ids?.length) {
    await roomModel.replaceRoomFacilities(roomId, payload.facility_ids);
  }

  return getRoomDetail(roomId);
}

async function updateRoom(id, payload) {
  const existing = await roomModel.findById(id);
  if (!existing) throw httpError("Room not found", 404);

  await roomModel.updateRoomById(id, payload);

  if (payload.facility_ids) {
    await roomModel.replaceRoomFacilities(id, payload.facility_ids);
  }

  return getRoomDetail(id);
}

module.exports = {
  listRoomsWithFacilitiesAndReviewAgg,
  getRoomDetail,
  createRoom,
  updateRoom,
  listRooms,
};
