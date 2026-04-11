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
const dashboardRoutes = require("./routes/dashboard.routes");
const weatherRoutes = require("./routes/weather.routes");
const userRoutes = require("./routes/user.routes");
const ai = require("./routes/ai.routes");
const unsplashRoutes = require("./routes/unsplash.routes");
const tariffRoutes = require("./routes/tariff.routes");
const leaseRoutes = require("./routes/lease.routes");
const invoiceAdminRoutes = require("./routes/invoice.admin.routes");
const facilityRoutes = require("./routes/facility.routes");
const meterRoutes = require("./routes/meter.routes");
const paymentAdminRoutes = require("./routes/payment.admin.routes");
const userAdminRoutes = require("./routes/user.admin.routes");
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
const {
  generalLimiter,
  authLimiter,
  aiLimiter,
  schedulerLimiter,
  relayLimiter,
} = require("./middlewares/rateLimit.middleware");

// LIMITER
app.use(generalLimiter);
// Specific limiters per route
app.use("/api/auth", authLimiter);
app.use("/api/ai", aiLimiter);
app.use("/api/scheduler", schedulerLimiter);
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
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ai", ai);
app.use("/api/unsplash", unsplashRoutes);
app.use("/api/tariff", tariffRoutes);
app.use("/api/leases", leaseRoutes);
app.use("/api/invoices", invoiceAdminRoutes);
app.use("/api/facilities", facilityRoutes);
app.use("/api/meters", meterRoutes);
app.use("/api/payments-admin", paymentAdminRoutes);
app.use("/api/users-admin", userAdminRoutes);
// 404 handler
app.use(notFound);
app.use(errorHandler);
module.exports = app;
