const { ok, fail } = require("../utils/response");
const { runOverdueInvoice } = require("../jobs/overdueInvoice.job");
const { runMonthlyBilling, getStatus } = require("../jobs/scheduler");

async function triggerOverdue(req, res) {
  try {
    const result = await runOverdueInvoice();
    return ok(res, result, "Overdue check selesai", 200);
  } catch (err) {
    return fail(res, err.message, err.statusCode || 500);
  }
}

async function triggerBilling(req, res) {
  try {
    const { month } = req.body;

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return fail(res, "Format month tidak valid, gunakan YYYY-MM", 400);
    }
    const result = await runMonthlyBilling(month);
    return ok(res, result, `Billing bulan ${month} selesai`, 200);
  } catch (err) {
    return fail(res, err.message, err.statusCode || 500);
  }
}

async function getJobStatus(req, res) {
  try {
    const status = getStatus();
    return ok(res, status, "OK", 200);
  } catch (err) {
    return fail(res, err.message, 500);
  }
}

module.exports = { triggerOverdue, triggerBilling, getJobStatus };
