const db = require("../config/db");

async function findAll({ search, is_available, page = 1, limit = 20 }) {
  const p = Math.max(1, Number(page));
  const l = Math.min(100, Math.max(1, Number(limit)));
  const offset = (p - 1) * l;

  const where = [];
  const params = [];

  if (typeof is_available === "boolean") {
    where.push("r.is_available = ?");
    params.push(is_available ? 1 : 0);
  }

  if (search) {
    where.push("(r.number LIKE ?)");
    params.push(`%${search}%`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [rows] = await db.query(
    `
    SELECT
      r.id,
      r.number,
      r.floor,
      r.price_monthly,
      r.deposit,
      r.is_available,
      r.description,
      r.main_image_url,
      r.created_at,
      r.updated_at,
      EXISTS (
        SELECT 1 FROM leases l
        WHERE l.room_id = r.id AND l.status = 'active'
      ) AS is_occupied
    FROM rooms r
    ${whereSql}
    ORDER BY r.number ASC
    LIMIT ? OFFSET ?
    `,
    [...params, l, offset],
  );

  const [countRows] = await db.query(
    `SELECT COUNT(*) AS total FROM rooms r ${whereSql}`,
    params,
  );

  return { rows, total: countRows[0]?.total || 0, page: p, limit: l };
}

async function findById(id) {
  const [rows] = await db.query(
    `
    SELECT
      r.*,
      EXISTS (
        SELECT 1 FROM leases l
        WHERE l.room_id = r.id AND l.status = 'active'
      ) AS is_occupied
    FROM rooms r
    WHERE r.id = ?
    LIMIT 1
    `,
    [id],
  );
  return rows[0] || null;
}

async function findFacilitiesByRoomId(room_id) {
  const [rows] = await db.query(
    `
    SELECT f.id, f.name
    FROM room_facilities rf
    JOIN facilities f ON f.id = rf.facility_id
    WHERE rf.room_id = ?
    ORDER BY f.name ASC
    `,
    [room_id],
  );
  return rows;
}

async function createRoom({
  number,
  floor = null,
  price_monthly,
  deposit = 0,
  is_available = true,
  description = null,
  main_image_url = null,
}) {
  const [result] = await db.query(
    `
    INSERT INTO rooms
      (number, floor, price_monthly, deposit, is_available, description, main_image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      number,
      floor,
      price_monthly,
      deposit,
      is_available ? 1 : 0,
      description,
      main_image_url,
    ],
  );
  return result.insertId;
}

async function updateRoomById(id, data) {
  const allowed = [
    "number",
    "floor",
    "price_monthly",
    "deposit",
    "is_available",
    "description",
    "main_image_url",
  ];

  const fields = [];
  const params = [];

  for (const key of allowed) {
    if (data[key] === undefined) continue;

    if (key === "is_available") {
      fields.push(`${key} = ?`);
      params.push(data[key] ? 1 : 0);
      continue;
    }

    fields.push(`${key} = ?`);
    params.push(data[key]);
  }

  if (!fields.length) return;

  params.push(id);

  await db.query(`UPDATE rooms SET ${fields.join(", ")} WHERE id = ?`, params);
}

async function replaceRoomFacilities(room_id, facility_ids) {
  await db.query(`DELETE FROM room_facilities WHERE room_id = ?`, [room_id]);

  if (!facility_ids || facility_ids.length === 0) return;

  const values = facility_ids.map((fid) => [room_id, fid]);
  await db.query(
    `INSERT INTO room_facilities (room_id, facility_id) VALUES ?`,
    [values],
  );
}

module.exports = {
  findAll,
  findById,
  findFacilitiesByRoomId,
  createRoom,
  updateRoomById,
  replaceRoomFacilities,
};
