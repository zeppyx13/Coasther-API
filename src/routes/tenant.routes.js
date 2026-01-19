const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const tenantController = require("../controllers/tenant.controller");

router.use(auth);
router.use(requireRole(["tenant", "admin", "manager"]));

router.get("/my-room", tenantController.myRoom);

module.exports = router;
