const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");

dotenv.config();
// Initialize Express App
const app = express();
const db = require("./config/db");
const PORT = process.env.PORT || 5000;
// init routes
const authRoutes = require("./routes/auth.routes");
const roomRoutes = require("./routes/room.routes");
const tenantRoutes = require("./routes/tenant.routes");
// Middleware
app.use(helmet());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// routes
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Coasther API",
  });
});
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/tenants", tenantRoutes);
// Start the server after verifying DB connection
(async () => {
  try {
    await db.query("SELECT 1");
    console.log("MySQL connected");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
})();

module.exports = app;
