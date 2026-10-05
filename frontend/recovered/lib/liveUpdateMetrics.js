// Cap-go/website 7d5b69d, AGPL-3.0. Maintained vanilla browser source.
import { sliceSparklineRows } from "./metricsTrendChart.js";
import { LIVE_UPDATE_METRICS_PATH } from "./publicLiveUpdateMetrics.js";
function emptyLiveUpdateMetrics() {
  return {
    success_rate: 0,
    first_try_rate: null,
    first_day_rate: null,
    first_day_success_rate: null,
    rollback_rate: null,
    zip_success_rate: null,
    delta_success_rate: null,
    updated_at: "",
    daily: [],
    daily_platforms: [],
    daily_platforms_sparkline: [],
    hourly_platforms: [],
    failures: [],
    platforms: [],
    countries: [],
    updater_versions: []
  };
}
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
function normalizeBreakdown(value) {
  if (!isRecord(value) || typeof value.key !== "string" || !value.key) return null;
  const top = isRecord(value.top_failure) ? {
    reason: typeof value.top_failure.reason === "string" ? value.top_failure.reason : "",
    share: percentage(value.top_failure.share)
  } : null;
  return {
    key: value.key,
    share: percentage(value.share),
    success_rate: nullablePercentage(value.success_rate),
    top_failure: top && top.reason ? top : null
  };
}
function normalizeLiveUpdateMetrics(value) {
  if (!isRecord(value) || typeof value.updated_at !== "string" || !Array.isArray(value.daily) || !Array.isArray(value.failures)) {
    return null;
  }
  const daily = value.daily.map((item) => {
    if (!isRecord(item) || typeof item.date !== "string") return null;
    return { date: item.date, success_rate: percentage(item.success_rate) };
  }).filter((item) => item !== null);
  const daily_platforms = Array.isArray(value.daily_platforms) ? value.daily_platforms.map((item) => {
    if (!isRecord(item) || typeof item.date !== "string") return null;
    return { date: item.date, ios: nullablePercentage(item.ios), android: nullablePercentage(item.android) };
  }).filter((item) => item !== null) : [];
  const daily_platforms_sparkline = Array.isArray(value.daily_platforms_sparkline) ? value.daily_platforms_sparkline.map((item) => {
    if (!isRecord(item) || typeof item.date !== "string") return null;
    return { date: item.date, ios: nullablePercentage(item.ios), android: nullablePercentage(item.android) };
  }).filter((item) => item !== null) : sliceSparklineRows(daily_platforms);
  const hourly_platforms = Array.isArray(value.hourly_platforms) ? value.hourly_platforms.map((item) => {
    if (!isRecord(item) || typeof item.date !== "string") return null;
    return { date: item.date, ios: nullablePercentage(item.ios), android: nullablePercentage(item.android) };
  }).filter((item) => item !== null) : [];
  const failures = value.failures.map((item) => {
    if (!isRecord(item) || typeof item.reason !== "string") return null;
    return { reason: item.reason, share: percentage(item.share) };
  }).filter((item) => item !== null);
  let platforms = [];
  if (Array.isArray(value.platforms)) {
    platforms = value.platforms.map(normalizeBreakdown).filter((item) => item !== null);
  } else if (isRecord(value.platforms)) {
    const legacyPlatforms = value.platforms;
    platforms = ["ios", "android", "electron"].map((key) => ({
      key,
      share: percentage(legacyPlatforms[key]),
      success_rate: null,
      top_failure: null
    })).filter((item) => item.share > 0);
  }
  const countries = Array.isArray(value.countries) ? value.countries.map(normalizeBreakdown).filter((item) => item !== null) : [];
  let updater_versions = [];
  if (Array.isArray(value.updater_versions)) {
    const breakdowns = value.updater_versions.map(normalizeBreakdown).filter((item) => item !== null);
    if (breakdowns.length > 0) {
      updater_versions = breakdowns;
    } else {
      const legacyRows = value.updater_versions.map((item) => {
        if (!isRecord(item) || typeof item.date !== "string" || typeof item.version !== "string") return null;
        return { date: item.date, version: item.version, share: percentage(item.share) };
      }).filter((item) => item !== null);
      const dayCount = new Set(legacyRows.map((item) => item.date)).size;
      const totals = /* @__PURE__ */ new Map();
      for (const item of legacyRows) {
        totals.set(item.version, (totals.get(item.version) ?? 0) + item.share);
      }
      updater_versions = [...totals].map(([key, share]) => ({
        key,
        share: dayCount ? share / dayCount : 0,
        success_rate: null,
        top_failure: null
      })).sort((a, b) => b.share - a.share).slice(0, 10);
    }
  }
  return {
    success_rate: percentage(value.success_rate),
    first_try_rate: nullablePercentage(value.first_try_rate),
    first_day_rate: nullablePercentage(value.first_day_rate),
    first_day_success_rate: nullablePercentage(value.first_day_success_rate),
    rollback_rate: nullablePercentage(value.rollback_rate),
    zip_success_rate: nullablePercentage(value.zip_success_rate),
    delta_success_rate: nullablePercentage(value.delta_success_rate),
    period_days: typeof value.period_days === "number" ? value.period_days : 30,
    daily_window_days: typeof value.daily_window_days === "number" ? value.daily_window_days : 90,
    updated_at: value.updated_at,
    daily,
    daily_platforms,
    daily_platforms_sparkline,
    hourly_platforms,
    failures,
    platforms,
    countries,
    updater_versions
  };
}
async function fetchLiveUpdateMetrics(endpoint = LIVE_UPDATE_METRICS_PATH) {
  try {
    const response = await fetch(endpoint, {
      headers: { Accept: "application/json" }
    });
    if (!response.ok) return null;
    const metrics = normalizeLiveUpdateMetrics(await response.json());
    return metrics ? { ...metrics, source: "api" } : null;
  } catch {
    return null;
  }
}
export {
  emptyLiveUpdateMetrics,
  fetchLiveUpdateMetrics,
  normalizeLiveUpdateMetrics
};
