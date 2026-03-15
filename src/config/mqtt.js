const mqtt = require("mqtt");
const db = require("./db");
const iotService = require("../services/iot.service");

const client = mqtt.connect({
  host: process.env.MQTT_HOST,
  port: process.env.MQTT_PORT,
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
  protocol: "mqtts",
});

client.on("connect", () => {
  console.log("MQTT Connected");

  client.subscribe("coasther/meter/+/reading", (err) => {
    if (err) {
      console.error("Subscribe error:", err);
    } else {
      console.log("Subscribed to meter readings");
    }
  });
});

client.on("message", async (topic, message) => {
  try {
    const payload = JSON.parse(message.toString());

    const deviceUid = topic.split("/")[2];

    console.log("MQTT Topic:", topic);
    console.log("Device UID:", deviceUid);
    console.log("Payload:", payload);

    const [rows] = await db.query(
      `
      SELECT id, room_id, type, unit
      FROM meters
      WHERE device_uid = ?
      LIMIT 1
      `,
      [deviceUid],
    );

    if (!rows.length) {
      console.warn("Device not registered:", deviceUid);
      return;
    }

    const meter = rows[0];

    await iotService.ingestMeterReading({
      meter,
      payload,
    });

    console.log("Reading stored:", meter.type, payload.reading_value);
  } catch (err) {
    console.error("MQTT processing error:", err.message);
  }
});

client.on("error", (err) => {
  console.error("MQTT Error:", err.message);
});

client.on("reconnect", () => {
  console.log("MQTT reconnecting...");
});

module.exports = client;
