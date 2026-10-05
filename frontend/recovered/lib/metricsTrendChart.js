// Cap-go/website 7d5b69d, AGPL-3.0. Maintained vanilla browser source.
const TREND_CHART = {
  width: 800,
  height: 260,
  pad: { l: 44, r: 16, t: 16, b: 28 }
};
const TREND_HISTORY_DAYS = 90;
const SPARKLINE_WINDOW_DAYS = 30;
const TREND_RANGE_OPTIONS = [
  { key: "1d", label: "1D", days: 1 },
  { key: "1w", label: "1W", days: 7 },
  { key: "1m", label: "1M", days: 30 },
  { key: "3m", label: "3M", days: 90 }
];
function trendRangeDays(key) {
  return TREND_RANGE_OPTIONS.find((option) => option.key === key)?.days ?? 30;
}
function formatUtcDate(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function buildRollingDailyBucketKeys(referenceDate = /* @__PURE__ */ new Date(), days = TREND_HISTORY_DAYS) {
  const end = new Date(Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(), referenceDate.getUTCDate()));
  const keys = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const cursor = new Date(end);
    cursor.setUTCDate(end.getUTCDate() - offset);
    keys.push(formatUtcDate(cursor));
  }
  return keys;
}
function buildContiguousDailyPlatformRows(rows, referenceDate = /* @__PURE__ */ new Date(), days = TREND_HISTORY_DAYS) {
  const byDate = new Map(rows.map((row) => [row.date, row]));
  return buildRollingDailyBucketKeys(referenceDate, days).map((date) => {
    const row = byDate.get(date);
    return row ?? { date, ios: null, android: null };
  });
}
function parseTrendUtcDate(date) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(date.trim());
  if (!match) return null;
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
}
function parseHourlyTrendDate(date) {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T| )(\d{2}):00/.exec(date.trim());
  if (!match) return null;
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), Number(match[4])));
}
function utcDayStart(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}
function trendWindowEndUtc(rows, referenceDate) {
  if (referenceDate) return utcDayStart(referenceDate);
  const last = rows.at(-1)?.date;
  const parsed = last ? parseTrendUtcDate(last) : null;
  return parsed ? utcDayStart(parsed) : utcDayStart(/* @__PURE__ */ new Date());
}
function sliceTrendRows(rows, key, referenceDate) {
  if (!rows.length) return rows;
  const days = trendRangeDays(key);
  const end = trendWindowEndUtc(rows, referenceDate);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  const filtered = rows.filter((row) => {
    const parsed = parseTrendUtcDate(row.date);
    if (!parsed) return false;
    const day = utcDayStart(parsed);
    return day >= start && day <= end;
  });
  if (filtered.length) return filtered;
  return rows.slice(Math.max(0, rows.length - days));
}
function sliceHourlyTrendRows(rows, referenceDate) {
  if (!rows.length) return rows;
  const ref = referenceDate ?? /* @__PURE__ */ new Date();
  const end = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), ref.getUTCDate(), ref.getUTCHours(), 0, 0, 0));
  const endExclusive = new Date(end);
  endExclusive.setUTCHours(endExclusive.getUTCHours() + 1);
  const start = new Date(endExclusive);
  start.setUTCHours(start.getUTCHours() - 24);
  const filtered = rows.filter((row) => {
    const parsed = parseHourlyTrendDate(row.date);
    if (!parsed) return false;
    return parsed >= start && parsed < endExclusive;
  });
  if (filtered.length) return filtered;
  return [];
}
function selectTrendRows(metrics, key, referenceDate) {
  if (key === "1d") {
    const hourly = metrics.hourly_platforms ?? [];
    const hourlyRows = sliceHourlyTrendRows(hourly, referenceDate);
    if (hourlyRows.length) return hourlyRows;
    return sliceTrendRows(metrics.daily_platforms, "1d", referenceDate);
  }
  return sliceTrendRows(metrics.daily_platforms, key, referenceDate);
}
function sliceSparklineRows(rows, referenceDate) {
  return sliceTrendRows(rows, "1m", referenceDate);
}
function trendRowUnit(rows, range) {
  if (range !== "1d") return "day";
  const sample = rows[0]?.date ?? "";
  return /(?:T| )\d{2}:\d{2}/.test(sample) ? "hour" : "day";
}
function formatTrendAxisLabel(date, range) {
  if (!date) return "";
  if (range === "1d") {
    const hourMatch = /(?:T| )(\d{2}):00/.exec(date);
    if (hourMatch) return `${hourMatch[1]}:00`;
    if (/^\d{2}:\d{2}$/.test(date)) return date;
  }
  return date.slice(0, 10);
}
function trendHitLeftPercent(index, count, width = TREND_CHART.width) {
  const pad = TREND_CHART.pad;
  const innerW = width - pad.l - pad.r;
  const x = count <= 1 ? pad.l + innerW / 2 : pad.l + index / (count - 1) * innerW;
  return x / width * 100;
}
function trendNearestIndex(clientX, plotLeft, plotWidth, count) {
  if (count <= 0) return -1;
  if (count === 1) return 0;
  const pad = TREND_CHART.pad;
  const innerW = plotWidth * ((TREND_CHART.width - pad.l - pad.r) / TREND_CHART.width);
  const left = plotWidth * (pad.l / TREND_CHART.width);
  const x = clientX - plotLeft - left;
  const ratio = Math.max(0, Math.min(1, x / innerW));
  return Math.round(ratio * (count - 1));
}
function formatTrendTooltip(date, ios, android, formatValue) {
  const label = date.length > 10 ? date.replace("T", " ") : date;
  return `${label} \xB7 iOS ${formatValue(ios)} \xB7 Android ${formatValue(android)}`;
}
export {
  SPARKLINE_WINDOW_DAYS,
  TREND_CHART,
  TREND_HISTORY_DAYS,
  TREND_RANGE_OPTIONS,
  buildContiguousDailyPlatformRows,
  buildRollingDailyBucketKeys,
  formatTrendAxisLabel,
  formatTrendTooltip,
  formatUtcDate,
  parseHourlyTrendDate,
  parseTrendUtcDate,
  selectTrendRows,
  sliceHourlyTrendRows,
  sliceSparklineRows,
  sliceTrendRows,
  trendHitLeftPercent,
  trendNearestIndex,
  trendRangeDays,
  trendRowUnit,
  trendWindowEndUtc
};
