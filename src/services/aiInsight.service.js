const { GoogleGenAI } = require("@google/genai");
const aiInsightModel = require("../models/aiInsight.model");

function httpError(message, statusCode = 400) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function buildUsageMap(rows) {
  const byType = {
    electric: [],
    water: [],
  };

  for (const row of rows) {
    const item = {
      date: row.usage_date,
      usage_value: toNumber(row.usage_value),
      unit: row.unit,
      sample_count: toNumber(row.sample_count),
      first_reading: toNumber(row.first_reading),
      last_reading: toNumber(row.last_reading),
    };

    if (row.type === "electric") byType.electric.push(item);
    if (row.type === "water") byType.water.push(item);
  }

  return byType;
}

function calcStats(items) {
  if (!items.length) {
    return {
      total: 0,
      avg_daily: 0,
      peak_day: null,
      peak_value: 0,
      recent_7_total: 0,
      previous_7_total: 0,
      trend_percent: 0,
    };
  }

  const total = items.reduce((sum, x) => sum + x.usage_value, 0);
  const avgDaily = total / items.length;

  let peak = items[0];
  for (const item of items) {
    if (item.usage_value > peak.usage_value) peak = item;
  }

  const recent7 = items.slice(-7);
  const previous7 = items.slice(-14, -7);

  const recent7Total = recent7.reduce((sum, x) => sum + x.usage_value, 0);
  const previous7Total = previous7.reduce((sum, x) => sum + x.usage_value, 0);

  let trendPercent = 0;
  if (previous7Total > 0) {
    trendPercent = ((recent7Total - previous7Total) / previous7Total) * 100;
  }

  return {
    total: Number(total.toFixed(3)),
    avg_daily: Number(avgDaily.toFixed(3)),
    peak_day: peak.date || null,
    peak_value: Number(peak.usage_value.toFixed(3)),
    recent_7_total: Number(recent7Total.toFixed(3)),
    previous_7_total: Number(previous7Total.toFixed(3)),
    trend_percent: Number(trendPercent.toFixed(2)),
  };
}

function buildPrompt({
  roomId,
  days,
  latestMeters,
  electricStats,
  waterStats,
  dailyUsage,
}) {
  return `
Kamu adalah analis penggunaan utilitas untuk aplikasi kost Coasther.

Tugas:
1. Analisis data penggunaan listrik dan air kamar.
2. Fokus pada pola boros, lonjakan, tren naik/turun, dan hari puncak.
3. Berikan insight yang singkat, tajam, dan praktis.
4. Jangan membuat angka baru. Gunakan hanya data yang tersedia.
5. Jika data kurang, nyatakan dengan jujur.

Konteks:
- room_id: ${roomId}
- periode_analisis_hari: ${days}

latest_meters:
${JSON.stringify(latestMeters, null, 2)}

electric_stats:
${JSON.stringify(electricStats, null, 2)}

water_stats:
${JSON.stringify(waterStats, null, 2)}

daily_usage:
${JSON.stringify(dailyUsage, null, 2)}

Keluarkan JSON yang sesuai schema.
`;
}

async function generateRoomInsight({ roomId, days = 30 }) {
  if (!roomId || Number.isNaN(Number(roomId))) {
    throw httpError("Invalid room id", 400);
  }

  const dailyRows = await aiInsightModel.getDailyUsageByRoom(roomId, days);
  const latestMeters = await aiInsightModel.getLatestMetersByRoom(roomId);

  if (!latestMeters.length) {
    throw httpError("No active meters found for this room", 404);
  }

  const usageMap = buildUsageMap(dailyRows);
  const electricStats = calcStats(usageMap.electric);
  const waterStats = calcStats(usageMap.water);

  const prompt = buildPrompt({
    roomId,
    days,
    latestMeters,
    electricStats,
    waterStats,
    dailyUsage: usageMap,
  });

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: {
        type: "object",
        properties: {
          summary: {
            type: "string",
            description: "Ringkasan umum kondisi penggunaan kamar.",
          },
          key_findings: {
            type: "array",
            description: "Temuan utama dari data penggunaan.",
            items: { type: "string" },
          },
          anomalies: {
            type: "array",
            description:
              "Lonjakan atau pola tidak biasa. Kosongkan jika tidak ada.",
            items: { type: "string" },
          },
          recommendations: {
            type: "array",
            description: "Saran hemat atau tindakan lanjutan yang konkret.",
            items: { type: "string" },
          },
          risk_level: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "Tingkat risiko pemborosan berdasarkan data.",
          },
        },
        required: [
          "summary",
          "key_findings",
          "anomalies",
          "recommendations",
          "risk_level",
        ],
      },
    },
  });

  let insight;
  try {
    insight = JSON.parse(response.text);
  } catch {
    throw httpError("Gemini returned invalid JSON", 502);
  }

  return {
    room_id: Number(roomId),
    period_days: Number(days),
    latest_meters: latestMeters,
    stats: {
      electric: electricStats,
      water: waterStats,
    },
    insight,
  };
}

module.exports = {
  generateRoomInsight,
};
