const { GoogleGenAI } = require("@google/genai");
const adminChatModel = require("../models/adminChat.model");
const logger = require("../config/logger");

function httpError(message, statusCode = 400) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function buildSystemPrompt(context) {
  return `
Kamu adalah asisten AI cerdas untuk aplikasi manajemen kost bernama **Coasther**.
Kamu membantu admin/manajer kost dalam memahami data operasional, keuangan, dan penghuni.

Panduan:
1. Jawab HANYA berdasarkan data konteks yang diberikan. Jangan mengarang data.
2. Gunakan bahasa Indonesia yang profesional namun mudah dipahami.
3. Jika data tidak tersedia untuk menjawab pertanyaan, katakan dengan jelas.
4. Berikan jawaban yang actionable dan spesifik.
5. Format jawaban dengan rapi menggunakan bullet points atau paragraf sesuai konteks.
6. Jangan menyebutkan nama teknis database atau struktur internal sistem.

Data operasional saat ini (bulan ${context.current_month}):

=== STATISTIK KAMAR ===
- Total kamar: ${context.room_stats.total_rooms}
- Terisi: ${context.room_stats.occupied_rooms}
- Tersedia: ${context.room_stats.available_rooms}
- Occupancy rate: ${Math.round((context.room_stats.occupied_rooms / context.room_stats.total_rooms) * 100)}%

=== KEUANGAN BULAN INI ===
- Total tagihan: ${context.invoice_stats.total_invoices}
- Sudah lunas: ${context.invoice_stats.paid}
- Belum bayar: ${context.invoice_stats.unpaid}
- Overdue: ${context.invoice_stats.overdue}
- Total pemasukan: Rp ${Number(context.invoice_stats.total_income).toLocaleString("id-ID")}
- Total piutang: Rp ${Number(context.invoice_stats.total_receivable).toLocaleString("id-ID")}

=== KELUHAN ===
- Total keluhan: ${context.complaint_stats.total}
- Belum ditangani (open): ${context.complaint_stats.open_count}
- Sedang diproses: ${context.complaint_stats.in_progress_count}
- Selesai: ${context.complaint_stats.closed_count}

=== KONTRAK HAMPIR HABIS (30 hari ke depan) ===
${
  context.expiring_leases.length > 0
    ? context.expiring_leases
        .map(
          (l) =>
            `- ${l.tenant_name} (Kamar ${l.room_number}): berakhir ${l.end_date}, sisa ${l.days_remaining} hari`,
        )
        .join("\n")
    : "- Tidak ada kontrak yang hampir habis"
}

=== TAGIHAN BELUM BAYAR ===
${
  context.overdue_invoices.length > 0
    ? context.overdue_invoices
        .map(
          (i) =>
            `- ${i.tenant_name} (Kamar ${i.room_number}): Rp ${Number(i.total_amount).toLocaleString("id-ID")}, jatuh tempo ${i.due_date}, telat ${i.days_overdue} hari`,
        )
        .join("\n")
    : "- Tidak ada tunggakan"
}

=== KELUHAN YANG BELUM SELESAI ===
${
  context.open_complaints.length > 0
    ? context.open_complaints
        .map(
          (c) =>
            `- [${c.status.toUpperCase()}] "${c.title}" - ${c.tenant_name} (Kamar ${c.room_number}), sudah ${c.days_open} hari`,
        )
        .join("\n")
    : "- Tidak ada keluhan aktif"
}

=== KAMAR KOSONG TERLAMA ===
${
  context.longest_empty_rooms.length > 0
    ? context.longest_empty_rooms
        .map(
          (r) =>
            `- Kamar ${r.number} (Lt ${r.floor}): kosong ${r.days_empty} hari, harga Rp ${Number(r.price_monthly).toLocaleString("id-ID")}/bulan`,
        )
        .join("\n")
    : "- Semua kamar terisi"
}

=== KAMAR DENGAN KELUHAN TERBANYAK ===
${context.top_complaint_rooms
  .map((r) => `- Kamar ${r.number}: ${r.complaint_count} keluhan`)
  .join("\n")}

=== PEMAKAIAN UTILITAS BULAN INI ===
${
  context.usage_this_month.length > 0
    ? context.usage_this_month
        .map(
          (u) =>
            `- Kamar ${u.room_number}: Air ${Number(u.water_used / 1000).toFixed(3)} m³, Listrik ${Number(u.elec_used).toFixed(1)} kWh`,
        )
        .join("\n")
    : "- Belum ada data pemakaian bulan ini"
}

=== RATING TERENDAH ===
${context.lowest_rated_rooms
  .map(
    (r) =>
      `- Kamar ${r.room_number}: ⭐ ${r.avg_rating ?? "Belum ada"} (${r.review_count} ulasan)`,
  )
  .join("\n")}
`;
}

async function adminChat({ question, conversationHistory = [] }) {
  if (!question || question.trim().length < 3) {
    throw httpError("Pertanyaan terlalu pendek", 400);
  }

  if (question.trim().length > 500) {
    throw httpError("Pertanyaan terlalu panjang (maks 500 karakter)", 400);
  }

  logger.info(`[AdminChat] Question: "${question.slice(0, 100)}"`);

  // Ambil konteks data DB
  const context = await adminChatModel.getDashboardContext();
  const systemPrompt = buildSystemPrompt(context);

  // Bangun history percakapan untuk multi-turn
  const contents = [];

  // Tambahkan riwayat percakapan sebelumnya (max 5 pesan terakhir)
  if (conversationHistory.length > 0) {
    const recent = conversationHistory.slice(-5);
    const historyContents = recent.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));
    contents.push(...historyContents);
  }

  // Tambahkan pesan saat ini (dengan system prompt)
  contents.push({
    role: "user",
    parts: [{ text: systemPrompt + "\n\nPertanyaan admin: " + question }],
  });

  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const response = await client.models.generateContent({
    model: process.env.GEMINI_MODEL,
    contents,
  });

  const answer = response.text?.trim();

  if (!answer) {
    throw httpError("AI tidak memberikan respons", 502);
  }

  logger.info(`[AdminChat] Answer length: ${answer.length} chars`);

  return {
    question,
    answer,
    context_month: context.current_month,
    timestamp: new Date().toISOString(),
  };
}

module.exports = { adminChat };
