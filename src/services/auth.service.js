const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userRepo = require("../repositories/users.repo");

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

async function register(payload) {
  const existing = await userRepo.findByEmail(payload.email);
  if (existing) {
    const err = new Error("Email already registered");
    err.statusCode = 409;
    throw err;
  }

  const password_hash = await bcrypt.hash(payload.password, 10);

  const userId = await userRepo.createUser({
    name: payload.name,
    email: payload.email,
    password_hash,
    phone: payload.phone || null,
    role: "tenant",
  });

  const user = await userRepo.findById(userId);
  const token = signToken({ id: user.id, role: user.role, email: user.email });

  return { user, token };
}

async function login(payload) {
  const userRow = await userRepo.findByEmail(payload.email);
  if (!userRow) {
    const err = new Error("Invalid email or password");
    err.statusCode = 401;
    throw err;
  }

  const match = await bcrypt.compare(payload.password, userRow.password_hash);
  if (!match) {
    const err = new Error("Invalid email or password");
    err.statusCode = 401;
    throw err;
  }

  const user = await userRepo.findById(userRow.id);
  const token = signToken({ id: user.id, role: user.role, email: user.email });

  return { user, token };
}

async function me(userId) {
  const user = await userRepo.findById(userId);
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }
  return user;
}

module.exports = { register, login, me };
