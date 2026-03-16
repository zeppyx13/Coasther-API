const { ok, fail } = require("../utils/response");
const { meterReadingSchema } = require("../validators/iot.validator");
const iotService = require("../services/iot.service");

async function meterReading(req, res) {
  try {
    const payload = meterReadingSchema.parse(req.body);
    const result = await iotService.ingestMeterReading({
      meter: req.meter,
      payload,
    });
    return ok(res, result, "Reading stored", 201);
  } catch (err) {
    return fail(res, err.message, err.statusCode || 400);
  }
}

async function getAllLiveStatus(req, res) {
  try {
    const result = await iotService.getAllLiveStatus();
    return ok(res, result, "Live status fetched");
  } catch (err) {
    return fail(res, err.message, err.statusCode || 500);
  }
}

async function getLiveStatusByRoomId(req, res) {
  try {
    const result = await iotService.getLiveStatusByRoomId(req.params.roomId);
    return ok(res, result, "Live status fetched");
  } catch (err) {
    return fail(res, err.message, err.statusCode || 400);
  }
}

module.exports = {
  meterReading,
  getAllLiveStatus,
  getLiveStatusByRoomId,
};
