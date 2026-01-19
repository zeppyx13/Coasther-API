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

module.exports = { meterReading };
