const mqtt = require("mqtt");
const db = require("./db");

let _io = null;

function setIo(io) {
  _io = io;
}

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
    if (err) console.error("Subscribe meter error:", err);
    else console.log("Subscribed to meter readings");
  });

  client.subscribe("coasther/telemetry/+/live", (err) => {
    if (err) console.error("Subscribe telemetry error:", err);
    else console.log("Subscribed to live telemetry");
  });
});

client.on("message", async (topic, message) => {
  try {
    const payload = JSON.parse(message.toString());
    const parts = topic.split("/");
    const iotService = require("../services/iot.service");

    console.log("MQTT Topic:", topic);
    console.log("Payload:", payload);

    if (
      parts.length === 4 &&
      parts[0] === "coasther" &&
      parts[1] === "meter" &&
      parts[3] === "reading"
    ) {
      const deviceUid = parts[2];

      const [rows] = await db.query(
        `SELECT id, room_id, type, unit, device_uid
         FROM meters
         WHERE device_uid = ?
         LIMIT 1`,
        [deviceUid],
      );

      if (!rows.length) {
        console.warn("Meter device not registered:", deviceUid);
        return;
      }

      const meter = rows[0];
      const result = await iotService.ingestMeterReading({ meter, payload });
      console.log("Meter reading stored:", result);

      if (_io) {
        _io.emit("meter_update", {
          device_uid: deviceUid,
          reading_value: payload.reading_value,
          recorded_at: payload.recorded_at,
          room_id: meter.room_id,
          type: meter.type,
        });
      }

      return;
    }

    if (
      parts.length === 4 &&
      parts[0] === "coasther" &&
      parts[1] === "telemetry" &&
      parts[3] === "live"
    ) {
      const roomTopicId = parts[2];
      const result = await iotService.ingestLiveTelemetry({
        roomTopicId,
        payload,
      });
      console.log("Live telemetry updated:", result);

      if (_io) {
        _io.emit("telemetry_update", {
          room_id: roomTopicId,
          ...payload,
        });
      }

      return;
    }

    console.warn("Unhandled MQTT topic:", topic);
  } catch (err) {
    console.error("MQTT processing error:", err.message);
    console.error("MQTT raw topic:", topic);
    console.error("MQTT raw payload:", message.toString());
  }
});

client.on("error", (err) => console.error("MQTT Error:", err.message));
client.on("reconnect", () => console.log("MQTT reconnecting..."));

module.exports = { client, setIo };
