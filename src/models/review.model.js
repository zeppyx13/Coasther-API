const db = require("../config/db");

async function createReview({ room_id, user_id, lease_id, rating, comment }) {
  const [result] = await db.query(
    `
    INSERT INTO reviews (room_id, user_id, lease_id, rating, comment)
    VALUES (?, ?, ?, ?, ?)
    `,
    [room_id, user_id, lease_id, rating, comment],
  );
  return result.insertId;
}

async function findByUserAndLease({ user_id, lease_id }) {
  const [rows] = await db.query(
    `
    SELECT *
    FROM reviews
    WHERE user_id = ? AND lease_id = ?
    LIMIT 1
    `,
    [user_id, lease_id],
  );
  return rows[0] || null;
}

async function findMyReviews(user_id) {
  const [rows] = await db.query(
    `
    SELECT
      r.id,
      r.rating,
      r.comment,
      r.created_at,
      rm.number AS room_number
    FROM reviews r
    JOIN rooms rm ON rm.id = r.room_id
    WHERE r.user_id = ?
    ORDER BY r.created_at DESC
    `,
    [user_id],
  );
  return rows;
}

async function findReviewsByRoom(room_id) {
  const [rows] = await db.query(
    `
    SELECT
      r.id,
      r.rating,
      r.comment,
      r.created_at,
      u.name AS user_name
    FROM reviews r
    JOIN users u ON u.id = r.user_id
    WHERE r.room_id = ?
    ORDER BY r.created_at DESC
    `,
    [room_id],
  );
  return rows;
}
async function findAllReviews() {
  const [rows] = await db.query(
    `SELECT users.name, rooms.number, reviews.rating, reviews.comment, reviews.created_at FROM reviews INNER JOIN users ON reviews.user_id = users.id Inner JOIN rooms ON reviews.room_id = rooms.id`,
  );
  return rows;
}
module.exports = {
  createReview,
  findByUserAndLease,
  findMyReviews,
  findReviewsByRoom,
  findAllReviews,
};
