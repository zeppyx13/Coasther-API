const db = require("../config/db");

async function findActiveAnnouncements({ page = 1, limit = 20 }) {
  const p = Math.max(1, Number(page));
  const l = Math.min(100, Math.max(1, Number(limit)));
  const offset = (p - 1) * l;

  const [rows] = await db.query(
    `
    SELECT
      id, title, body, start_at, end_at, is_active, created_at
    FROM announcements
    WHERE is_active = 1
      AND (start_at IS NULL OR start_at <= UTC_TIMESTAMP())
      AND (end_at IS NULL OR end_at >= UTC_TIMESTAMP())
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
    `,
    [l, offset],
  );

  const [countRows] = await db.query(
    `
    SELECT COUNT(*) AS total
    FROM announcements
    WHERE is_active = 1
      AND (start_at IS NULL OR start_at <= UTC_TIMESTAMP())
      AND (end_at IS NULL OR end_at >= UTC_TIMESTAMP())
    `,
  );

  return { rows, total: countRows[0]?.total || 0, page: p, limit: l };
}

module.exports = { findActiveAnnouncements };
