const db = require("../config/db");

async function findLastReading(meter_id) {
  const [rows] = await db.query(
    `
    SELECT id, reading_value, recorded_at
    FROM meter_readings
    WHERE meter_id = ?
    ORDER BY recorded_at DESC, id DESC
    LIMIT 1
    `,
    [meter_id],
  );
  return rows[0] || null;
}

async function insertReading({ meter_id, reading_value, recorded_at }) {
  const [result] = await db.query(
    `
    INSERT INTO meter_readings (meter_id, reading_value, recorded_at)
    VALUES (?, ?, ?)
    `,
    [meter_id, reading_value, recorded_at],
  );
  return result.insertId;
}

module.exports = { findLastReading, insertReading };
