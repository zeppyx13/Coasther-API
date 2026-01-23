const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/forgot-password/otp", authController.sendResetOtp);
router.post("/forgot-password/otp/verify", authController.verifyResetOtp);
router.post("/forgot-password/otp/reset", authController.resetPasswordWithOtp);
router.get("/me", authMiddleware, authController.me);
module.exports = router;
