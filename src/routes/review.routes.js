const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const reviewController = require("../controllers/review.controller");

// tenant
router.post(
  "/",
  auth,
  requireRole(["tenant", "admin", "manager"]),
  reviewController.create,
);

router.get(
  "/my",
  auth,
  requireRole(["tenant", "admin", "manager"]),
  reviewController.myReviews,
);

router.get("/rooms/:id", reviewController.roomReviews);

module.exports = router;
