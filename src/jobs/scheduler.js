const cron = require("node-cron");
const { runUsageMonthly } = require("./usageMonthly.job");
const { generateInvoicesForMonth } = require("./invoiceMonthly.job");
const logger = require("../config/logger"); // tambah ini

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
    logger.warn(
      `[scheduler] Invalid cron expression in ${envKey}: "${val}", using fallback: "${fallback}"`,
    );
  }
  return fallback;
}

async function runMonthlyBilling(month) {
  if (isRunning) {
    logger.info("[scheduler] Skip: billing job already running");
    return;
  }

  isRunning = true;
  try {
    logger.info(`[scheduler] START monthly billing month=${month}`);
    const usageRes = await runUsageMonthly(month);
    logger.info(`[scheduler] USAGE done: ${JSON.stringify(usageRes)}`);
    const invRes = await generateInvoicesForMonth(month);
    logger.info(`[scheduler] INVOICES done: ${JSON.stringify(invRes)}`);
    logger.info(`[scheduler] DONE monthly billing month=${month}`);
  } catch (err) {
    logger.error(`[scheduler] ERROR monthly billing: ${err.message}`, err);
  } finally {
    isRunning = false;
  }
}

async function runCurrentMonthUsage() {
  if (isCurrentRunning) {
    logger.info("[scheduler] Skip: current month job already running");
    return;
  }

  isCurrentRunning = true;
  try {
    const currentMonth = getCurrentMonthYYYYMM();
    logger.info(
      `[scheduler] START update current month usage month=${currentMonth}`,
    );
    const result = await runUsageMonthly(currentMonth);
    logger.info(
      `[scheduler] Current month usage updated: ${JSON.stringify(result)}`,
    );
  } catch (err) {
    logger.error(`[scheduler] ERROR update current month: ${err.message}`, err);
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

  logger.info(`[scheduler] Cron scheduled:`);
  logger.info(`[scheduler]   - Monthly billing  : ${cronMonthlyBilling}`);
  logger.info(`[scheduler]   - Current month    : ${cronCurrentMonth}`);
}

module.exports = { startScheduler, runMonthlyBilling, runCurrentMonthUsage };
