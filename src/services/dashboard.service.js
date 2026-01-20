const tenantService = require("./tenant.service");
const usageTenantService = require("./usageTenant.service");
const invoiceService = require("./invoice.service");
const announcementService = require("./announcement.service");

async function getTenantDashboard(userId) {
  const [myRoomRes, myUsageRes, announcementsRes] = await Promise.all([
    tenantService.getMyRoom(userId),
    usageTenantService.getMyUsageMonthly(userId, null),
    announcementService.listAnnouncements({ page: 1, limit: 5 }),
  ]);

  let currentInvoice = null;
  try {
    const invRes = await invoiceService.getMyCurrentInvoice(userId);
    currentInvoice = invRes;
  } catch (e) {
    if (e.statusCode === 404) currentInvoice = null;
    else throw e;
  }

  return {
    lease: myRoomRes.lease,
    room: myRoomRes.room,
    usage: myUsageRes,
    invoice_current: currentInvoice,
    announcements: announcementsRes.announcements,
  };
}

module.exports = { getTenantDashboard };
