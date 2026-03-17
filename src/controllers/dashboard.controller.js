const { ok, fail } = require("../utils/response");
const dashboardService = require("../services/dashboard.service");

async function tenantDashboard(req, res) {
  try {
    const result = await dashboardService.getTenantDashboard(req.user.id);
    return ok(res, result, "OK", 200);
  } catch (err) {
    return fail(res, err.message, err.statusCode || 400);
  }
}
async function getDashboardStats(req, res, next) {
  try {
    const stats = await dashboardService.getDashboardStats();

    return res.status(200).json({
      success: true,
      message: "Dashboard stats fetched successfully",
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { tenantDashboard, getDashboardStats };
