const dotenv = require("dotenv");
dotenv.config();

const app = require("./src/app");
const db = require("./src/config/db");
const mqttClient = require("./src/config/mqtt");
const PORT = process.env.PORT;

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
