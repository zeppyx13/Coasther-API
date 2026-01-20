const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const dashboardController = require("../controllers/dashboard.controller");

router.get(
  "/",
  auth,
  requireRole(["tenant", "admin", "manager"]),
  dashboardController.tenantDashboard,
);

module.exports = router;
