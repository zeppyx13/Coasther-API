const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const sendMail = require("../lib/mailer").sendMail;
function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
}
function generateOtp6() {
  return String(Math.floor(100000 + Math.random() * 900000));
}
async function register(payload) {
  const existing = await userModel.findByEmail(payload.email);
  if (existing) {
    const err = new Error("Email already registered");
    err.statusCode = 409;
    throw err;
  }

  const password_hash = await bcrypt.hash(payload.password, 10);

  const userId = await userModel.createUser({
    name: payload.name,
    email: payload.email,
    password_hash,
    phone: payload.phone || null,
    role: "tenant",
  });

  const user = await userModel.findById(userId);
  const token = signToken({ id: user.id, role: user.role, email: user.email });

  return { user, token };
}

async function login(payload) {
  const userRow = await userModel.findByEmail(payload.email);
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

  const user = await userModel.findById(userRow.id);
  const token = signToken({ id: user.id, role: user.role, email: user.email });

  return { user, token };
}

async function me(userId) {
  const user = await userModel.findById(userId);
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }
  return user;
}

async function forgotPassword({ email }) {
  const user = await userModel.findByEmail(email);
  const safeResponse = {
    message: "If the email exists, reset instructions will be sent.",
  };

  if (!user) return safeResponse;

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = sha256(token);
  const expires = new Date(Date.now() + 30 * 60 * 1000);

  await userModel.setResetTokenByEmail(email, tokenHash, expires);

  await sendMail({
    to: user.email,
    subject: "Reset Password Coasther",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6">
        <h2>Reset Password</h2>
        <p>Halo <b>${user.name}</b>,</p>
        <p>Kami menerima permintaan reset password akun Coasther Anda.</p>
        <p>OTP anda adalah:</p>
        <p>
          <b
             style="display:inline-block;padding:10px 16px;
                    background:#7A1E2D;color:#fff;
                    text-decoration:none;border-radius:6px">
            ${token}
          </b>
        </p>
        <p>Link ini berlaku selama <b>30 menit</b>.</p>
        <p>Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini.</p>
        <br/>
        <p>— Coasther Team</p>
      </div>
    `,
  });

  return safeResponse;
}

async function resetPassword({ token, password }) {
  const tokenHash = sha256(token);
  const user = await userModel.findByResetTokenHash(tokenHash);
  if (!user) {
    const err = new Error("Invalid or expired token");
    err.statusCode = 400;
    throw err;
  }

  const exp = user.reset_token_expires_at
    ? new Date(user.reset_token_expires_at)
    : null;
  if (!exp || exp.getTime() < Date.now()) {
    const err = new Error("Invalid or expired token");
    err.statusCode = 400;
    throw err;
  }

  const password_hash = await bcrypt.hash(password, 10);
  await userModel.updatePasswordAndClearReset(user.id, password_hash);

  return { message: "Password reset success" };
}
async function sendResetOtp({ email }) {
  const user = await userModel.getOtpMetaByEmail(email);

  // anti email enumeration: response selalu sama
  const safeResponse = { message: "If the email exists, OTP has been sent." };
  if (!user) return safeResponse;

  // anti spam resend: minimal tunggu 60 detik
  if (user.reset_otp_sent_at) {
    const last = new Date(user.reset_otp_sent_at).getTime();
    if (Date.now() - last < 60 * 1000) return safeResponse;
  }

  const otp = generateOtp6();
  const otpHash = sha256(otp);
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 menit

  await userModel.setResetOtpByEmail(email, otpHash, expires);

  await sendMail({
    to: user.email,
    subject: "OTP Reset Password Coasther",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6">
        <h2>OTP Reset Password</h2>
        <p>Halo <b>${user.name}</b>,</p>
        <p>Gunakan OTP berikut untuk reset password:</p>
        <p style="font-size: 28px; letter-spacing: 4px; font-weight: bold;">${otp}</p>
        <p>OTP berlaku selama <b>10 menit</b>. Jangan bagikan kode ini kepada siapa pun.</p>
        <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
        <br/>
        <p>— Coasther Team</p>
      </div>
    `,
  });

  return safeResponse;
}
async function verifyResetOtp({ email, otp }) {
  const user = await userModel.getOtpMetaByEmail(email);
  if (!user) {
    const err = new Error("Invalid OTP");
    err.statusCode = 400;
    throw err;
  }

  if (!user.reset_otp_hash || !user.reset_otp_expires_at) {
    const err = new Error("OTP not requested");
    err.statusCode = 400;
    throw err;
  }
  if (new Date(user.reset_otp_expires_at).getTime() < Date.now()) {
    const err = new Error("OTP expired");
    err.statusCode = 400;
    throw err;
  }
  if (Number(user.reset_otp_attempts || 0) >= 5) {
    const err = new Error("Too many attempts. Request a new OTP.");
    err.statusCode = 429;
    throw err;
  }

  const otpHash = sha256(otp);

  if (otpHash !== user.reset_otp_hash) {
    await userModel.increaseOtpAttempts(user.id);
    const err = new Error("Invalid OTP");
    err.statusCode = 400;
    throw err;
  }

  return { message: "OTP valid" };
}

async function resetPasswordWithOtp({ email, otp, password }) {
  await verifyResetOtp({ email, otp });

  const user = await userModel.getOtpMetaByEmail(email);
  if (!user) {
    const err = new Error("Invalid request");
    err.statusCode = 400;
    throw err;
  }

  const password_hash = await bcrypt.hash(password, 10);
  await userModel.updatePassword(user.id, password_hash);
  await userModel.clearResetOtp(user.id);

  return { message: "Password reset success" };
}

module.exports = {
  register,
  login,
  me,
  forgotPassword,
  resetPassword,
  sendResetOtp,
  verifyResetOtp,
  resetPasswordWithOtp,
};
