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
      console.error("Subscribe meter error:", err);
    } else {
      console.log("Subscribed to meter readings");
    }
  });

  client.subscribe("coasther/telemetry/+/live", (err) => {
    if (err) {
      console.error("Subscribe telemetry error:", err);
    } else {
      console.log("Subscribed to live telemetry");
    }
  });
});

client.on("message", async (topic, message) => {
  try {
    const payload = JSON.parse(message.toString());
    const parts = topic.split("/");

    console.log("MQTT Topic:", topic);
    console.log("Payload:", payload);

    // meter reading for billing and historical data
    if (
      parts.length === 4 &&
      parts[0] === "coasther" &&
      parts[1] === "meter" &&
      parts[3] === "reading"
    ) {
      const deviceUid = parts[2];

      console.log("Meter Device UID:", deviceUid);

      const [rows] = await db.query(
        `
        SELECT id, room_id, type, unit, device_uid
        FROM meters
        WHERE device_uid = ?
        LIMIT 1
        `,
        [deviceUid],
      );

      if (!rows.length) {
        console.warn("Meter device not registered:", deviceUid);
        return;
      }

      const meter = rows[0];

      await iotService.ingestMeterReading({
        meter,
        payload,
      });

      console.log("Meter reading stored:", meter.type, payload.reading_value);
      return;
    }

    // live telemetry for dashboard
    if (
      parts.length === 4 &&
      parts[0] === "coasther" &&
      parts[1] === "telemetry" &&
      parts[3] === "live"
    ) {
      const roomTopicId = parts[2];

      console.log("Telemetry Room Topic:", roomTopicId);

      await iotService.ingestLiveTelemetry({
        roomTopicId,
        payload,
      });

      console.log("Live telemetry updated for room:", payload.room_id);
      return;
    }

    console.warn("Unhandled MQTT topic:", topic);
  } catch (err) {
    console.error("MQTT processing error:", err.message);
    console.error("MQTT raw topic:", topic);
    console.error("MQTT raw payload:", message.toString());
  }
});

client.on("error", (err) => {
  console.error("MQTT Error:", err.message);
});

client.on("reconnect", () => {
  console.log("MQTT reconnecting...");
});

module.exports = client;
