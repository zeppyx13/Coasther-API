const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

// routes
const authRoutes = require("./routes/auth.routes");
const roomRoutes = require("./routes/room.routes");
const tenantRoutes = require("./routes/tenant.routes");

const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
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

module.exports = app;
