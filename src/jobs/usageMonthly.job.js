const usageModel = require("../models/usageMonthly.model");

function httpError(message, statusCode = 400) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function assertYYYYMM(month) {
  if (!/^\d{4}-\d{2}$/.test(month)) {
    throw httpError("month must be in YYYY-MM format", 400);
  }
  const [y, m] = month.split("-").map(Number);
  if (m < 1 || m > 12) throw httpError("Invalid month", 400);
  return { y, m };
}

function getMonthRangeUTC(month) {
  const { y, m } = assertYYYYMM(month);
  const startAt = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
  const endAt = new Date(Date.UTC(y, m, 1, 0, 0, 0));
  return { startAt, endAt };
}

function toNumber3(x) {
  const n = Number(x || 0);
  return Math.round(n * 1000) / 1000;
}

async function computeStartEndForMeter(meter_id, startAt, endAt) {
  // start reading
  let start = await usageModel.findLastReadingBefore(meter_id, startAt);
  if (!start) {
    start = await usageModel.findFirstReadingInRange(meter_id, startAt, endAt);
  }
  const startVal = toNumber3(start?.reading_value ?? 0);

  // end reading
  let end = await usageModel.findLastReadingBefore(meter_id, endAt);
  if (!end) {
    end = await usageModel.findLastReadingInRange(meter_id, startAt, endAt);
  }
  const endVal = toNumber3(end?.reading_value ?? startVal);

  const usedVal = toNumber3(Math.max(0, endVal - startVal));

  return { startVal, endVal, usedVal };
}

async function runUsageMonthly(month) {
  const { startAt, endAt } = getMonthRangeUTC(month);
  const roomIds = await usageModel.findAllRoomIds();

  let processed = 0;

  for (const roomId of roomIds) {
    const waterMeter = await usageModel.findMeterByRoomAndType(roomId, "water");
    const elecMeter = await usageModel.findMeterByRoomAndType(
      roomId,
      "electricity",
    );

    let water = { startVal: 0, endVal: 0, usedVal: 0 };
    let elec = { startVal: 0, endVal: 0, usedVal: 0 };

    if (waterMeter) {
      water = await computeStartEndForMeter(waterMeter.id, startAt, endAt);
    }
    if (elecMeter) {
      elec = await computeStartEndForMeter(elecMeter.id, startAt, endAt);
    }

    await usageModel.upsertUsageMonthly({
      room_id: roomId,
      month,
      water_start: water.startVal,
      water_end: water.endVal,
      water_used: water.usedVal,
      elec_start: elec.startVal,
      elec_end: elec.endVal,
      elec_used: elec.usedVal,
      computed_at: new Date(),
    });

    processed += 1;
  }

  return {
    month,
    start_at: startAt.toISOString(),
    end_at: endAt.toISOString(),
    rooms_processed: processed,
  };
}

module.exports = { runUsageMonthly };
