const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const tenantController = require("../controllers/tenant.controller");
const invoiceController = require("../controllers/invoice.controller");
router.use(auth);
router.use(requireRole(["tenant", "admin", "manager"]));

router.get("/my-room", tenantController.myRoom);
router.get("/my-invoices/current", invoiceController.myCurrentInvoice);
router.get("/my-invoices", invoiceController.myInvoices);
module.exports = router;
