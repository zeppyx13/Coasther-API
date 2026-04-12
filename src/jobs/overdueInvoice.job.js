const overdueModel = require("../models/overdue.model");
const logger = require("../config/logger");

async function runOverdueInvoice() {
  const lateFeeFlat = await overdueModel.getLateFeeFlat();
  const invoices = await overdueModel.findOverdueInvoices();

  if (!invoices.length) {
    logger.info("[overdue] Tidak ada invoice yang perlu diupdate");
    return { updated: 0 };
  }

  let updated = 0;

  for (const inv of invoices) {
    try {
      const rent = Number(inv.rent_amount);
      const water = Number(inv.water_cost);
      const elec = Number(inv.elec_cost);
      const discount = Number(inv.discount_amount);
      const fine = lateFeeFlat;

      const total = rent + water + elec - discount + fine;

      await overdueModel.markOverdueWithFine(inv.id, {
        fine_amount: fine,
        total_amount: total,
      });

      logger.info(
        `[overdue] Invoice #${inv.id} (user:${inv.user_id} room:${inv.room_id} bulan:${inv.month}) → overdue | denda: ${fine} | total baru: ${total}`,
      );

      updated++;
    } catch (err) {
      logger.error(
        `[overdue] Gagal update invoice #${inv.id}: ${err.message}`,
        err,
      );
    }
  }

  logger.info(`[overdue] Selesai — ${updated} invoice diupdate`);
  return { updated };
}

module.exports = { runOverdueInvoice };
