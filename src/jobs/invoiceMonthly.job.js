for (const lease of leases) {
  const usage = await invoiceModel.findUsageMonthly(lease.room_id, month);

  // water dari usage_monthly tersimpan dalam liter (dari ESP32)
  // konversi ke m³ sebelum billing karena tariff pakai m³
  const water_used_liter = toNumber3(usage?.water_used ?? 0);
  const water_used = toNumber3(water_used_liter / 1000); // liter → m³

  const elec_used = toNumber3(usage?.elec_used ?? 0);

  const water_billable = Math.max(
    0,
    water_used - Number(tariff.water_free_quota),
  );
  const elec_billable = Math.max(
    0,
    elec_used - Number(tariff.electricity_free_quota),
  );

  const water_cost = roundInt(water_billable * Number(tariff.water_rate));
  const elec_cost = roundInt(elec_billable * Number(tariff.electricity_rate));

  const rent_amount = roundInt(lease.monthly_rent_snapshot);

  const fine_amount = 0;
  const discount_percent = 0;
  const discount_amount = 0;

  const total_amount =
    rent_amount + water_cost + elec_cost - discount_amount + fine_amount;
  const status = "unpaid";

  await invoiceModel.upsertInvoice({
    lease_id: lease.lease_id,
    room_id: lease.room_id,
    user_id: lease.user_id,
    month,
    due_date,
    rent_amount,
    water_used,
    water_cost,
    elec_used,
    elec_cost,
    fine_amount,
    discount_percent,
    discount_amount,
    total_amount,
    status,
  });

  processed += 1;
}
