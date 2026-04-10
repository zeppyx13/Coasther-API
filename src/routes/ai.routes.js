const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const aiController = require("../controllers/ai.controller");

router.get(
  "/rooms/:roomId/insight",
  auth,
  requireRole(["admin", "manager", "tenant"]),
  aiController.getRoomInsight,
);

router.get(
  "/rooms/:roomId/prediction",
  auth,
  requireRole(["admin", "manager", "tenant"]),
  aiController.getRoomPrediction,
);

module.exports = router;
