const cron = require("node-cron");
const { runUsageMonthly } = require("./usageMonthly.job");
const { generateInvoicesForMonth } = require("./invoiceMonthly.job");

let isRunning = false;

function getPrevMonthYYYYMM() {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const prev = new Date(Date.UTC(y, m - 1, 1));
  const yy = prev.getUTCFullYear();
  const mm = String(prev.getUTCMonth() + 1).padStart(2, "0");
  return `${yy}-${mm}`;
}

async function runMonthlyBilling(month) {
  if (isRunning) {
    console.log("[scheduler] Skip: job already running");
    return;
  }

  isRunning = true;
  try {
    console.log(`[scheduler] START monthly billing month=${month}`);

    const usageRes = await runUsageMonthly(month);
    console.log("[scheduler] USAGE done:", usageRes);

    const invRes = await generateInvoicesForMonth(month);
    console.log("[scheduler] INVOICES done:", invRes);

    console.log(`[scheduler] DONE monthly billing month=${month}`);
  } catch (err) {
    console.error("[scheduler] ERROR:", err);
  } finally {
    isRunning = false;
  }
}
function startScheduler() {
  cron.schedule("10 0 1 * *", async () => {
    const prevMonth = getPrevMonthYYYYMM();
    await runMonthlyBilling(prevMonth);
  });

  console.log("[scheduler] Cron scheduled: 10 0 1 * * (monthly)");
}

module.exports = { startScheduler, runMonthlyBilling };
