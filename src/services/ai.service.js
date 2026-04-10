const { GoogleGenAI } = require("@google/genai");
const ai = require("../models/ai.model");
const feeModel = require("../models/fee.model");
const WATER_RATE = feeModel.getfreequota().waterRate;
const ELEC_RATE = feeModel.getfreequota().electricRate;
const WATER_FREE_QUOTA = feeModel.getfreequota().waterQuota;
const ELEC_FREE_QUOTA = feeModel.getfreequota().electricQuota;

// =====================================================
// UTILITIES
// =====================================================
function httpError(message, statusCode = 400) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function getDaysInfo() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const remaining = totalDays - today;
  return { today, totalDays, remaining };
}

// =====================================================
// INSIGHT HELPERS
// =====================================================
function buildUsageMap(rows) {
  const byType = { electric: [], water: [] };

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

// =====================================================
// PROMPT BUILDERS
// =====================================================
function buildInsightPrompt({
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

function buildPredictionPrompt({
  roomId,
  history,
  currentUsage,
  daysInfo,
  roomPrice,
}) {
  return `
Kamu adalah sistem prediksi konsumsi utilitas untuk aplikasi manajemen kost Coasther.

Tugas:
1. Analisis histori pemakaian air dan listrik 6 bulan terakhir.
2. Hitung rata-rata harian berdasarkan pemakaian bulan berjalan sampai hari ini.
3. Prediksi total pemakaian air (liter) dan listrik (kWh) hingga akhir bulan.
4. Hitung estimasi tagihan berdasarkan tarif berikut:
   - Sewa bulanan: Rp ${roomPrice?.price_monthly ?? 0}
   - Air: gratis ${WATER_FREE_QUOTA} m³ pertama, kelebihan Rp ${WATER_RATE}/m³
   - Listrik: gratis ${ELEC_FREE_QUOTA} kWh pertama, kelebihan Rp ${ELEC_RATE}/kWh
5. Berikan confidence level prediksi (low/medium/high) berdasarkan konsistensi data histori.
6. Jangan membuat angka baru selain dari kalkulasi data yang tersedia.

Data:
- room_id: ${roomId}
- Hari ini: ${daysInfo.today} dari ${daysInfo.totalDays} hari
- Sisa hari bulan ini: ${daysInfo.remaining} hari

Histori 6 bulan (water_used = liter, elec_used = kWh):
${JSON.stringify(history, null, 2)}

Pemakaian bulan berjalan (sampai hari ini):
${JSON.stringify(currentUsage, null, 2)}

Keluarkan JSON sesuai schema yang diberikan.
`;
}

// =====================================================
// GEMINI CALL HELPER
// =====================================================
function getAiClient() {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

async function callGemini(prompt, schema) {
  const ai = getAiClient();

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: schema,
    },
  });

  try {
    return JSON.parse(response.text);
  } catch {
    throw httpError("Gemini returned invalid JSON", 502);
  }
}

// =====================================================
// INSIGHT SCHEMA
// =====================================================
const insightSchema = {
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
      description: "Lonjakan atau pola tidak biasa. Kosongkan jika tidak ada.",
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
};

// =====================================================
// PREDICTION SCHEMA
// =====================================================
const predictionSchema = {
  type: "object",
  properties: {
    water: {
      type: "object",
      properties: {
        used_so_far_liter: { type: "number" },
        predicted_total_liter: { type: "number" },
        predicted_total_m3: { type: "number" },
        daily_avg_liter: { type: "number" },
      },
    },
    electricity: {
      type: "object",
      properties: {
        used_so_far_kwh: { type: "number" },
        predicted_total_kwh: { type: "number" },
        daily_avg_kwh: { type: "number" },
      },
    },
    billing: {
      type: "object",
      properties: {
        rent: { type: "number" },
        water_cost: { type: "number" },
        electricity_cost: { type: "number" },
        estimated_total: { type: "number" },
        compared_last_month: { type: "string" },
      },
    },
    confidence: { type: "string", enum: ["low", "medium", "high"] },
    summary: { type: "string" },
    tips: { type: "array", items: { type: "string" } },
  },
};

// =====================================================
// MAIN FUNCTIONS
// =====================================================
async function generateRoomInsight({ roomId, days = 30 }) {
  if (!roomId || Number.isNaN(Number(roomId))) {
    throw httpError("Invalid room id", 400);
  }

  const dailyRows = await ai.getDailyUsageByRoom(roomId, days);
  const latestMeters = await ai.getLatestMetersByRoom(roomId);

  if (!latestMeters.length) {
    throw httpError("No active meters found for this room", 404);
  }

  const usageMap = buildUsageMap(dailyRows);
  const electricStats = calcStats(usageMap.electric);
  const waterStats = calcStats(usageMap.water);

  const prompt = buildInsightPrompt({
    roomId,
    days,
    latestMeters,
    electricStats,
    waterStats,
    dailyUsage: usageMap,
  });
  const insight = await callGemini(prompt, insightSchema);

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

async function generateRoomPrediction({ roomId }) {
  if (!roomId || Number.isNaN(Number(roomId))) {
    throw httpError("Invalid room id", 400);
  }

  const [history, currentUsage, roomPrice] = await Promise.all([
    ai.getUsageHistory(roomId, 6),
    ai.getCurrentMonthUsage(roomId),
    ai.getRoomPrice(roomId),
  ]);

  if (!roomPrice) {
    throw httpError("Room not found", 404);
  }

  const daysInfo = getDaysInfo();
  const prompt = buildPredictionPrompt({
    roomId,
    history,
    currentUsage,
    daysInfo,
    roomPrice,
  });
  const prediction = await callGemini(prompt, predictionSchema);

  return {
    room_id: Number(roomId),
    days_info: daysInfo,
    prediction,
  };
}

module.exports = {
  generateRoomInsight,
  generateRoomPrediction,
};
