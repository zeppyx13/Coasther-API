const db = require("../config/db");

async function countTotalRooms() {
  const [rows] = await db.query(`
    SELECT COUNT(*) AS totalRooms
    FROM rooms
  `);

  return Number(rows[0]?.totalRooms || 0);
}

async function countAvailableRooms() {
  const [rows] = await db.query(`
    SELECT COUNT(*) AS availableRooms
    FROM rooms
    WHERE is_available = 1
  `);

  return Number(rows[0]?.availableRooms || 0);
}

async function countTotalTenants() {
  const [rows] = await db.query(`
    SELECT COUNT(*) AS totalTenants
    FROM users
    WHERE role = 'tenant'
  `);

  return Number(rows[0]?.totalTenants || 0);
}

async function countActiveTenants() {
  const [rows] = await db.query(`
    SELECT COUNT(DISTINCT user_id) AS activeTenants
    FROM leases
    WHERE status = 'active'
  `);

  return Number(rows[0]?.activeTenants || 0);
}

async function getCurrentMonthWaterUsage() {
  const [rows] = await db.query(`
    SELECT COALESCE(SUM(water_used), 0) AS waterUsage
    FROM usage_monthly
    WHERE month = DATE_FORMAT(CURRENT_DATE(), '%Y-%m')
  `);

  return Number(rows[0]?.waterUsage || 0);
}

async function getLastMonthWaterUsage() {
  const [rows] = await db.query(`
    SELECT COALESCE(SUM(water_used), 0) AS waterUsage
    FROM usage_monthly
    WHERE month = DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH), '%Y-%m')
  `);

  return Number(rows[0]?.waterUsage || 0);
}

async function getCurrentMonthElectricityUsage() {
  const [rows] = await db.query(`
    SELECT COALESCE(SUM(elec_used), 0) AS electricityUsage
    FROM usage_monthly
    WHERE month = DATE_FORMAT(CURRENT_DATE(), '%Y-%m')
  `);

  return Number(rows[0]?.electricityUsage || 0);
}

async function getLastMonthElectricityUsage() {
  const [rows] = await db.query(`
    SELECT COALESCE(SUM(elec_used), 0) AS electricityUsage
    FROM usage_monthly
    WHERE month = DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH), '%Y-%m')
  `);

  return Number(rows[0]?.electricityUsage || 0);
}

module.exports = {
  countTotalRooms,
  countAvailableRooms,
  countTotalTenants,
  countActiveTenants,
  getCurrentMonthWaterUsage,
  getLastMonthWaterUsage,
  getCurrentMonthElectricityUsage,
  getLastMonthElectricityUsage,
};
