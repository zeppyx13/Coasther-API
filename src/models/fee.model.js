const db = require("../config/db");

async function getfreequota() {
  const [rows] = await db.query(`
        SELECT 	electricity_free_quota as electricQuota, water_free_quota as waterQuota,water_rate as waterRate,electricity_rate as electricRate from tariff_settings `);

  return {
    electricQuota: Number(rows[0]?.electricQuota || 0),
    waterQuota: Number(rows[0]?.waterQuota || 0),
    waterRate: Number(rows[0]?.waterRate || 0),
    electricRate: Number(rows[0]?.electricRate || 0),
  };
}

module.exports = { getfreequota };
