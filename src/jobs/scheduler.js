const cron = require("node-cron");
const { runUsageMonthly } = require("./usageMonthly.job");
const { generateInvoicesForMonth } = require("./invoiceMonthly.job");

let isRunning = false;
let isCurrentRunning = false;

function getPrevMonthYYYYMM() {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const prev = new Date(Date.UTC(y, m - 1, 1));
  const yy = prev.getUTCFullYear();
  const mm = String(prev.getUTCMonth() + 1).padStart(2, "0");
  return `${yy}-${mm}`;
}

function getCurrentMonthYYYYMM() {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function getCronExpression(envKey, fallback) {
  const val = process.env[envKey];
  if (val && cron.validate(val)) return val;
  if (val && !cron.validate(val)) {
    console.warn(
      `[scheduler] Invalid cron expression in ${envKey}: "${val}", using fallback: "${fallback}"`,
    );
  }
  return fallback;
}

async function runMonthlyBilling(month) {
  if (isRunning) {
    console.log("[scheduler] Skip: billing job already running");
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

async function runCurrentMonthUsage() {
  if (isCurrentRunning) {
    console.log("[scheduler] Skip: current month job already running");
    return;
  }

  isCurrentRunning = true;
  try {
    const currentMonth = getCurrentMonthYYYYMM();
    console.log(
      `[scheduler] START update current month usage month=${currentMonth}`,
    );
    const result = await runUsageMonthly(currentMonth);
    console.log("[scheduler] Current month usage updated:", result);
  } catch (err) {
    console.error("[scheduler] ERROR update current month:", err);
  } finally {
    isCurrentRunning = false;
  }
}

function startScheduler() {
  const cronMonthlyBilling = getCronExpression(
    "CRON_MONTHLY_BILLING",
    "10 0 1 * *",
  );
  const cronCurrentMonth = getCronExpression("CRON_CURRENT_MONTH", "0 1 * * *");

  cron.schedule(cronMonthlyBilling, async () => {
    const prevMonth = getPrevMonthYYYYMM();
    await runMonthlyBilling(prevMonth);
  });

  cron.schedule(cronCurrentMonth, async () => {
    await runCurrentMonthUsage();
  });

  console.log("[scheduler] Cron scheduled:");
  console.log(`[scheduler]   - Monthly billing  : ${cronMonthlyBilling}`);
  console.log(`[scheduler]   - Current month    : ${cronCurrentMonth}`);
}

module.exports = { startScheduler, runMonthlyBilling, runCurrentMonthUsage };
