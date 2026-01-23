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
async function setResetTokenByEmail(
  email,
  reset_token_hash,
  reset_token_expires_at,
) {
  await db.query(
    `UPDATE users
     SET reset_token_hash = ?, reset_token_expires_at = ?
     WHERE email = ?`,
    [reset_token_hash, reset_token_expires_at, email],
  );
}

async function findByResetTokenHash(reset_token_hash) {
  const [rows] = await db.query(
    `SELECT id, email, reset_token_expires_at
     FROM users
     WHERE reset_token_hash = ?
     LIMIT 1`,
    [reset_token_hash],
  );
  return rows[0] || null;
}

async function updatePasswordAndClearReset(id, password_hash) {
  await db.query(
    `UPDATE users
     SET password_hash = ?, reset_token_hash = NULL, reset_token_expires_at = NULL
     WHERE id = ?`,
    [password_hash, id],
  );
}
async function setResetOtpByEmail(email, reset_otp_hash, reset_otp_expires_at) {
  await db.query(
    `UPDATE users
     SET reset_otp_hash = ?, reset_otp_expires_at = ?, reset_otp_attempts = 0, reset_otp_sent_at = NOW()
     WHERE email = ?`,
    [reset_otp_hash, reset_otp_expires_at, email],
  );
}

async function getOtpMetaByEmail(email) {
  const [rows] = await db.query(
    `SELECT id, name, email, reset_otp_hash, reset_otp_expires_at, reset_otp_attempts, reset_otp_sent_at
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [email],
  );
  return rows[0] || null;
}

async function increaseOtpAttempts(userId) {
  await db.query(
    `UPDATE users
     SET reset_otp_attempts = reset_otp_attempts + 1
     WHERE id = ?`,
    [userId],
  );
}

async function clearResetOtp(userId) {
  await db.query(
    `UPDATE users
     SET reset_otp_hash = NULL,
         reset_otp_expires_at = NULL,
         reset_otp_attempts = 0,
         reset_otp_sent_at = NULL
     WHERE id = ?`,
    [userId],
  );
}

async function updatePassword(userId, password_hash) {
  await db.query(`UPDATE users SET password_hash = ? WHERE id = ?`, [
    password_hash,
    userId,
  ]);
}
module.exports = {
  findByEmail,
  findById,
  createUser,
  updateById,
  setResetTokenByEmail,
  findByResetTokenHash,
  updatePasswordAndClearReset,
  setResetOtpByEmail,
  getOtpMetaByEmail,
  increaseOtpAttempts,
  clearResetOtp,
  updatePassword,
};
