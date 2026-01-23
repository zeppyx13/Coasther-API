const { ok, fail } = require("../utils/response");
const userService = require("../services/user.service");
const { updateMeSchema } = require("../validators/user.validator");

async function updateMe(req, res) {
  try {
    const payload = updateMeSchema.parse(req.body);
    const result = await userService.updateMe(req.user.id, payload);
    return ok(res, result, "Profile updated", 200);
  } catch (err) {
    return fail(res, err.message, err.statusCode || 400);
  }
}

module.exports = { updateMe };
