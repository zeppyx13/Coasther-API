const { ok, fail } = require("../utils/response");
const authService = require("../services/auth.service");
const { registerSchema, loginSchema } = require("../validators/auth.validator");

async function register(req, res) {
  try {
    const payload = registerSchema.parse(req.body);
    const result = await authService.register(payload);
    return ok(res, result, "Register success", 201);
  } catch (err) {
    return fail(res, err.message, err.statusCode || 400);
  }
}

async function login(req, res) {
  try {
    const payload = loginSchema.parse(req.body);
    const result = await authService.login(payload);
    return ok(res, result, "Login success", 200);
  } catch (err) {
    return fail(res, err.message, err.statusCode || 400);
  }
}

async function me(req, res) {
  try {
    const user = await authService.me(req.user.id);
    return ok(res, { user }, "OK", 200);
  } catch (err) {
    return fail(res, err.message, err.statusCode || 400);
  }
}

module.exports = { register, login, me };
