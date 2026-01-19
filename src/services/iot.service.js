const iotModel = require("../models/iot.model");

function httpError(message, statusCode = 400) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

async function ingestMeterReading({ meter, payload }) {
  const last = await iotModel.findLastReading(meter.id);

  if (last && Number(payload.reading_value) < Number(last.reading_value)) {
    throw httpError("Reading value cannot be less than last reading", 400);
  }

  const recordedAt = payload.recorded_at
    ? new Date(payload.recorded_at)
    : new Date();

  const readingId = await iotModel.insertReading({
    meter_id: meter.id,
    reading_value: payload.reading_value,
    recorded_at: recordedAt,
  });

  return {
    reading_id: readingId,
    meter_id: meter.id,
    room_id: meter.room_id,
    type: meter.type,
    unit: meter.unit,
    reading_value: payload.reading_value,
    recorded_at: recordedAt,
  };
}

module.exports = { ingestMeterReading };
