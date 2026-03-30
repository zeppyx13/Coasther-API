const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const complaintController = require("../controllers/complaint.controller");

router.use(auth);
router.use(requireRole(["tenant", "admin", "manager"]));

router.get("/", complaintController.list);
router.get("/:id", complaintController.detail);
router.post("/", complaintController.create);
router.patch("/:id", complaintController.update);
router.get("/admin/complaints", complaintController.listAll);
module.exports = router;
