const db = require("../config/db");

async function findByEmail(email) {
  const [rows] = await db.query(
    "SELECT id, name, email, password_hash, role, phone, is_verified, created_at FROM users WHERE email = ? LIMIT 1",
    [email],
  );
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await db.query(
    "SELECT id, name, email, role, phone, avatar_url, is_verified, created_at FROM users WHERE id = ? LIMIT 1",
    [id],
  );
  return rows[0] || null;
}

async function createUser({
  name,
  email,
  password_hash,
  role = "tenant",
  phone = null,
}) {
  const [result] = await db.query(
    `INSERT INTO users (name, email, password_hash, role, phone, is_verified)
     VALUES (?, ?, ?, ?, ?, 1)`,
    [name, email, password_hash, role, phone],
  );

  return result.insertId;
}

async function updateById(id, data) {
  const allowed = ["name", "phone"];
  const fields = [];
  const params = [];

  for (const key of allowed) {
    if (data[key] === undefined) continue;
    fields.push(`${key} = ?`);
    params.push(data[key]);
  }

  if (!fields.length) return;

  params.push(id);
  await db.query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, params);
}
module.exports = { findByEmail, findById, createUser, updateById };
