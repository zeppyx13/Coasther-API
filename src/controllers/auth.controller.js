const { ok, fail } = require("../utils/response");
const authService = require("../services/auth.service");
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  sendOtpSchema,
  verifyOtpSchema,
  resetPasswordWithOtpSchema,
} = require("../validators/auth.validator");

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

async function forgotPassword(req, res) {
  try {
    const payload = forgotPasswordSchema.parse(req.body);
    const result = await authService.forgotPassword(payload);
    return ok(res, result, "OK", 200);
  } catch (err) {
    return fail(res, err.message, err.statusCode || 400);
  }
}

async function resetPassword(req, res) {
  try {
    const payload = resetPasswordSchema.parse(req.body);
    const result = await authService.resetPassword(payload);
    return ok(res, result, "OK", 200);
  } catch (err) {
    return fail(res, err.message, err.statusCode || 400);
  }
}

async function sendResetOtp(req, res) {
  try {
    const payload = sendOtpSchema.parse(req.body);
    const result = await authService.sendResetOtp(payload);
    return ok(res, result, "OK", 200);
  } catch (err) {
    return fail(res, err.message, err.statusCode || 400);
  }
}

async function verifyResetOtp(req, res) {
  try {
    const payload = verifyOtpSchema.parse(req.body);
    const result = await authService.verifyResetOtp(payload);
    return ok(res, result, "OK", 200);
  } catch (err) {
    return fail(res, err.message, err.statusCode || 400);
  }
}

async function resetPasswordWithOtp(req, res) {
  try {
    const payload = resetPasswordWithOtpSchema.parse(req.body);
    const result = await authService.resetPasswordWithOtp(payload);
    return ok(res, result, "OK", 200);
  } catch (err) {
    return fail(res, err.message, err.statusCode || 400);
  }
}
module.exports = {
  register,
  login,
  me,
  forgotPassword,
  resetPassword,
  sendResetOtp,
  verifyResetOtp,
  resetPasswordWithOtp,
};
