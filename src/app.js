const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

// routes
const authRoutes = require("./routes/auth.routes");
const roomRoutes = require("./routes/room.routes");
const tenantRoutes = require("./routes/tenant.routes");
const paymentRoutes = require("./routes/payment.routes");
const iotRoutes = require("./routes/iot.routes");
const announcementRoutes = require("./routes/announcement.routes");
const reviewRoutes = require("./routes/review.routes");
const complaintRoutes = require("./routes/complaint.routes");
// app init
const app = express();

// Middleware
const notFound = require("./middlewares/notFound.middleware");
const errorHandler = require("./middlewares/error.middleware");
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
app.use("/api/payments", paymentRoutes);
app.use("/api/iot", iotRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/complaints", complaintRoutes);
// 404 handler
app.use(notFound);
app.use(errorHandler);
module.exports = app;
