// Cap-go/website 7d5b69d, AGPL-3.0. Maintained vanilla browser source.
function deriveUsage(mau, updatesByMonth, updateSizeMb) {
  const updates = mau * updatesByMonth;
  return {
    mau,
    bandwidthGiB: updates * updateSizeMb / 1024,
    storageGiB: updateSizeMb / 1024
  };
}
function getOverageUsage(usage, plan) {
  return {
    mau: Math.max(0, usage.mau - plan.mau),
    bandwidthGiB: Math.max(0, usage.bandwidthGiB - plan.bandwidth),
    storageGiB: Math.max(0, usage.storageGiB - plan.storage)
  };
}
function getIncludedUsage(usage, plan) {
  return {
    mau: Math.min(usage.mau, plan.mau),
    bandwidthGiB: Math.min(usage.bandwidthGiB, plan.bandwidth),
    storageGiB: Math.min(usage.storageGiB, plan.storage)
  };
}
function planSortPrice(plan, yearly) {
  return yearly ? plan.price_y : plan.price_m * 12;
}
function recommendPlan(plans, usage, yearly) {
  const sorted = [...plans].sort((a, b) => planSortPrice(a, yearly) - planSortPrice(b, yearly));
  const fitting = sorted.filter((plan) => usage.mau <= plan.mau && usage.bandwidthGiB <= plan.bandwidth && usage.storageGiB <= plan.storage);
  if (fitting.length > 0) return fitting[0];
  return sorted[sorted.length - 1];
}
function getPlanMonthlyPrice(plan, yearly) {
  return yearly ? plan.price_y / 12 : plan.price_m;
}
function getPlanBillingPrice(plan, yearly) {
  return yearly ? plan.price_y : plan.price_m;
}
const gibToBytes = (gib) => Math.round(gib * 1024 * 1024 * 1024);
function usageToCreditPayload(usage, plan) {
  return {
    mau: Math.round(usage.mau),
    bandwidth: gibToBytes(usage.bandwidthGiB),
    storage: gibToBytes(usage.storageGiB),
    ...plan ? {
      included: {
        mau: plan.mau,
        bandwidth: gibToBytes(plan.bandwidth),
        storage: gibToBytes(plan.storage)
      }
    } : {}
  };
}
export {
  deriveUsage,
  getIncludedUsage,
  getOverageUsage,
  getPlanBillingPrice,
  getPlanMonthlyPrice,
  planSortPrice,
  recommendPlan,
  usageToCreditPayload
};
