// Cap-go/website 7d5b69d, AGPL-3.0. Maintained vanilla browser source.
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function percentage(value) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.min(100, number)) : 0;
}
function nullablePercentage(value) {
  if (value === null || value === void 0 || value === "") return null;
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.min(100, number)) : null;
}
function nullableNumber(value) {
  if (value === null || value === void 0 || value === "") return null;
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : null;
}
function normalizeFailure(value) {
  if (!isRecord(value) || typeof value.reason !== "string" || !value.reason) return null;
  return { reason: value.reason, share: percentage(value.share) };
}
function normalizePlatform(value) {
  if (!isRecord(value) || value.key !== "ios" && value.key !== "android") return null;
  const top = normalizeFailure(value.top_failure);
  return {
    key: value.key,
    share: percentage(value.share),
    success_rate: nullablePercentage(value.success_rate),
    avg_process_seconds: nullableNumber(value.avg_process_seconds),
    avg_queue_seconds: nullableNumber(value.avg_queue_seconds),
    top_failure: top
  };
}
function normalizePlatformTrendRows(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    if (!isRecord(item) || typeof item.date !== "string") return null;
    return {
      date: item.date,
      ios: nullablePercentage(item.ios),
      android: nullablePercentage(item.android),
      ios_process_seconds: nullableNumber(item.ios_process_seconds),
      android_process_seconds: nullableNumber(item.android_process_seconds)
    };
  }).filter((item) => item !== null);
}
function emptyBuilderMetrics() {
  return {
    success_rate: 0,
    avg_process_seconds: null,
    avg_queue_seconds: null,
    period_days: 30,
    daily_window_days: 90,
    updated_at: "",
    daily_platforms: [],
    hourly_platforms: [],
    failures: [],
    platforms: []
  };
}
function normalizeBuilderMetrics(value) {
  if (!isRecord(value) || typeof value.updated_at !== "string" || !value.updated_at || !Array.isArray(value.daily_platforms) || !Array.isArray(value.failures) || !Array.isArray(value.platforms)) {
    return null;
  }
  const daily_platforms = normalizePlatformTrendRows(value.daily_platforms);
  const hourly_platforms = normalizePlatformTrendRows(value.hourly_platforms);
  const failures = value.failures.map(normalizeFailure).filter((item) => item !== null);
  const platforms = value.platforms.map(normalizePlatform).filter((item) => item !== null);
  return {
    success_rate: percentage(value.success_rate),
    avg_process_seconds: nullableNumber(value.avg_process_seconds),
    avg_queue_seconds: nullableNumber(value.avg_queue_seconds),
    period_days: 30,
    daily_window_days: typeof value.daily_window_days === "number" ? value.daily_window_days : 90,
    updated_at: value.updated_at,
    daily_platforms,
    hourly_platforms,
    failures,
    platforms
  };
}
export {
  emptyBuilderMetrics,
  normalizeBuilderMetrics
};
