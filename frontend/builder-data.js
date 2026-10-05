// Cap-go/website 7d5b69d, AGPL-3.0. Maintained vanilla browser source.
import { getBuilderFailureInfo } from "./recovered/lib/builderFailureReasons.js";
import { normalizeBuilderMetrics } from "./recovered/lib/builderMetrics.js";
import {
  formatTrendAxisLabel,
  formatTrendTooltip,
  selectTrendRows,
  sliceSparklineRows,
  TREND_RANGE_OPTIONS,
  trendHitLeftPercent,
  trendNearestIndex,
  trendRowUnit
} from "./recovered/lib/metricsTrendChart.js";
function boot() {
  const page = document.querySelector(".data-page");
  const endpoint = page?.dataset.metricsEndpoint;
  const updated = page?.querySelector("[data-updated]");
  const statusBadge = page?.querySelector("[data-status-badge]");
  const kpiStatus = page?.querySelector("[data-kpi-status]");
  const successRateKpi = page?.querySelector('[data-kpi="success-rate"]');
  const processKpi = page?.querySelector('[data-kpi="process"]');
  const queueKpi = page?.querySelector('[data-kpi="queue"]');
  const iosSuccessKpi = page?.querySelector('[data-kpi="ios-success"]');
  const iosFailureKpi = page?.querySelector('[data-kpi="ios-failure"]');
  const androidSuccessKpi = page?.querySelector('[data-kpi="android-success"]');
  const androidFailureKpi = page?.querySelector('[data-kpi="android-failure"]');
  const iosProcess = page?.querySelector('[data-process="ios"]');
  const androidProcess = page?.querySelector('[data-process="android"]');
  const iosTopFailure = page?.querySelector('[data-top-failure="ios"]');
  const androidTopFailure = page?.querySelector('[data-top-failure="android"]');
  const iosSpark = page?.querySelector('[data-spark="ios"]');
  const androidSpark = page?.querySelector('[data-spark="android"]');
  const trendLabel = page?.querySelector("[data-trend-label]");
  const trendSvg = page?.querySelector("[data-trend-svg]");
  const trendIos = page?.querySelector('[data-trend-line="ios"]');
  const trendAndroid = page?.querySelector('[data-trend-line="android"]');
  const trendIosMarkers = page?.querySelector('[data-trend-markers="ios"]');
  const trendAndroidMarkers = page?.querySelector('[data-trend-markers="android"]');
  const trendStart = page?.querySelector("[data-trend-start]");
  const trendEnd = page?.querySelector("[data-trend-end]");
  const trendMax = page?.querySelector("[data-trend-max]");
  const trendMid = page?.querySelector("[data-trend-mid]");
  const trendMin = page?.querySelector("[data-trend-min]");
  const trendOverlay = page?.querySelector("[data-trend-overlay]");
  const trendTooltip = page?.querySelector("[data-trend-tooltip]");
  const trendGuide = page?.querySelector("[data-trend-guide]");
  const trendStatus = page?.querySelector("[data-trend-status]");
  const dailySkeleton = page?.querySelector(".data-chart-skeleton");
  const failuresLead = page?.querySelector("[data-failures-lead]");
  const failuresList = page?.querySelector("[data-failures]");
  const trendRangeButtons = [...page?.querySelectorAll("[data-trend-range]") ?? []];
  const metricButtons = [...page?.querySelectorAll("[data-metric]") ?? []];
  const styleScopeAttributes = [...page?.attributes ?? []].map((attribute) => attribute.name).filter((name) => name.startsWith("data-astro-cid-"));
  let trendRange = "1m";
  let metric = "rate";
  let latestMetrics = null;
  function createScopedElement(tag) {
    const element = document.createElement(tag);
    for (const attribute of styleScopeAttributes) element.setAttribute(attribute, "");
    return element;
  }
  function formatRate(value) {
    return value === null ? "\u2014" : `${Number(value.toFixed(1))}%`;
  }
  function formatDuration(seconds) {
    if (seconds === null) return "\u2014";
    if (seconds < 90) return `${Math.round(seconds)}s`;
    return `${(seconds / 60).toFixed(1)} min`;
  }
  function failureRate(success) {
    return success === null ? null : Number((100 - success).toFixed(1));
  }
  function sparkTone(rate) {
    if (rate === null) return "empty";
    return rate >= 70 ? "good" : "poor";
  }
  function sparkTip(date, rate) {
    return `${date}: ${formatRate(rate)}`;
  }
  function trendTip(date, ios, android) {
    return formatTrendTooltip(date, ios, android, metric === "rate" ? formatRate : formatDuration);
  }
  let trendRows = [];
  let trendFocusIndex = -1;
  const trendOverlayLabel = "Builder success trend values. Move pointer across the chart or use arrow keys.";
  function clampTrendTooltip(leftPercent) {
    return Math.max(8, Math.min(92, leftPercent));
  }
  function trendStatusAnnounce(rows) {
    const metricLabel = metric === "rate" ? "Build success" : "Processing time";
    const rangeLabel = TREND_RANGE_OPTIONS.find((option) => option.key === trendRange)?.label ?? trendRange;
    if (!rows.length) return "Builder trend unavailable";
    const unit = trendRowUnit(rows, trendRange);
    const dates = rows.length === 1 ? rows[0].date : `${rows[0]?.date} to ${rows.at(-1)?.date}`;
    return `${metricLabel} trend updated for ${rangeLabel}: ${rows.length} ${unit}${rows.length === 1 ? "" : "s"} (${dates})`;
  }
  function clearTrendSelection(announce = "") {
    trendFocusIndex = -1;
    if (trendTooltip) trendTooltip.hidden = true;
    if (trendGuide) trendGuide.hidden = true;
    if (trendStatus) trendStatus.textContent = announce;
    if (trendOverlay) trendOverlay.setAttribute("aria-label", trendOverlayLabel);
  }
  function showTrendPoint(index) {
    if (!trendOverlay || !trendTooltip) return;
    const row = trendRows[index];
    if (!row) {
      trendTooltip.hidden = true;
      if (trendGuide) trendGuide.hidden = true;
      if (trendStatus) trendStatus.textContent = "";
      return;
    }
    const iosValue = metric === "rate" ? row.ios : row.ios_process_seconds;
    const androidValue = metric === "rate" ? row.android : row.android_process_seconds;
    const tooltip = trendTip(row.date, iosValue, androidValue);
    const guideLeft = trendHitLeftPercent(index, trendRows.length);
    const tooltipLeft = clampTrendTooltip(guideLeft);
    trendFocusIndex = index;
    trendTooltip.textContent = tooltip;
    trendTooltip.hidden = false;
    trendTooltip.style.left = `${tooltipLeft}%`;
    if (trendGuide) {
      trendGuide.hidden = false;
      trendGuide.style.left = `${guideLeft}%`;
    }
    if (trendStatus) trendStatus.textContent = tooltip;
    trendOverlay.setAttribute("aria-label", tooltip);
  }
  function bindTrendOverlay() {
    if (!trendOverlay) return;
    trendOverlay.addEventListener("pointermove", (event) => {
      if (!trendRows.length) return;
      const rect = trendOverlay.getBoundingClientRect();
      const index = trendNearestIndex(event.clientX, rect.left, rect.width, trendRows.length);
      showTrendPoint(index);
    });
    trendOverlay.addEventListener("pointerleave", () => {
      trendFocusIndex = -1;
      if (trendTooltip) trendTooltip.hidden = true;
      if (trendGuide) trendGuide.hidden = true;
      if (trendStatus) trendStatus.textContent = "";
      trendOverlay.setAttribute("aria-label", trendOverlayLabel);
    });
    trendOverlay.addEventListener("keydown", (event) => {
      if (!trendRows.length) return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "Home" && event.key !== "End") return;
      event.preventDefault();
      const next = event.key === "Home" ? 0 : event.key === "End" ? trendRows.length - 1 : Math.max(0, Math.min(trendRows.length - 1, (trendFocusIndex < 0 ? 0 : trendFocusIndex) + (event.key === "ArrowRight" ? 1 : -1)));
      showTrendPoint(next);
    });
  }
  bindTrendOverlay();
  function platformOf(metrics, key) {
    return metrics.platforms.find((item) => item.key === key) ?? {
      key,
      share: 0,
      success_rate: null,
      avg_process_seconds: null,
      avg_queue_seconds: null,
      top_failure: null
    };
  }
  function sliceDays(rows, days) {
    return rows.slice(Math.max(0, rows.length - days));
  }
  function chartScale(values, kind) {
    if (!values.length) return kind === "rate" ? { min: 0, max: 100 } : { min: 0, max: 300 };
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = Math.max(kind === "rate" ? 3 : 20, (max - min) * 0.25);
    if (kind === "rate") {
      return { min: Math.max(0, Number((min - pad).toFixed(1))), max: Math.min(100, Number((max + pad).toFixed(1))) };
    }
    return { min: Math.max(0, Number((min - pad).toFixed(1))), max: Number((max + pad).toFixed(1)) };
  }
  function chartPoints(values, scale, width = 800, height = 260) {
    const pad = { l: 44, r: 16, t: 16, b: 28 };
    const innerW = width - pad.l - pad.r;
    const innerH = height - pad.t - pad.b;
    const span = Math.max(scale.max - scale.min, 1);
    return values.map((value, index) => {
      if (value === null) return null;
      const x = pad.l + (values.length <= 1 ? innerW / 2 : index / (values.length - 1) * innerW);
      const y = pad.t + (1 - (value - scale.min) / span) * innerH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).filter((point) => point !== null).join(" ");
  }
  function formatTick(value) {
    return metric === "rate" ? formatRate(value) : formatDuration(value);
  }
  function renderTrendMarker(group, values, scale, show, fill) {
    if (!group) return;
    group.replaceChildren();
    if (!show) return;
    const coords = chartPoints(values, scale);
    if (!coords) return;
    const [cx, cy] = coords.split(",");
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", cx);
    circle.setAttribute("cy", cy);
    circle.setAttribute("r", "5");
    circle.setAttribute("fill", fill);
    group.append(circle);
  }
  function renderSpark(target, rows, key) {
    if (!target) return;
    target.replaceChildren();
    for (const row of rows) {
      const tick = createScopedElement("i");
      tick.dataset.tone = sparkTone(row[key]);
      tick.dataset.tip = sparkTip(row.date, row[key]);
      target.append(tick);
    }
  }
  function trendReferenceDate(metrics) {
    const timestamp = new Date(metrics.updated_at);
    return Number.isNaN(timestamp.getTime()) ? void 0 : timestamp;
  }
  function renderTrend(metrics) {
    const rows = selectTrendRows(metrics, trendRange, trendRange === "1d" ? trendReferenceDate(metrics) : void 0);
    const iosValues = rows.map((row) => metric === "rate" ? row.ios : row.ios_process_seconds);
    const androidValues = rows.map((row) => metric === "rate" ? row.android : row.android_process_seconds);
    const values = [...iosValues, ...androidValues].filter((value) => value !== null);
    const scale = chartScale(values, metric === "rate" ? "rate" : "duration");
    const mid = Number(((scale.min + scale.max) / 2).toFixed(1));
    if (trendLabel) trendLabel.textContent = metric === "rate" ? "Build success" : "Processing time";
    if (trendSvg) {
      trendSvg.style.display = rows.length ? "" : "none";
      trendSvg.setAttribute("aria-label", metric === "rate" ? "iOS and Android build success" : "iOS and Android processing time");
    }
    if (dailySkeleton) dailySkeleton.hidden = rows.length > 0;
    if (trendIos) trendIos.setAttribute("points", chartPoints(iosValues, scale));
    if (trendAndroid) trendAndroid.setAttribute("points", chartPoints(androidValues, scale));
    const showIosMarker = iosValues.filter((value) => value !== null).length === 1;
    const showAndroidMarker = androidValues.filter((value) => value !== null).length === 1;
    renderTrendMarker(trendIosMarkers, iosValues, scale, showIosMarker, "#60a5fa");
    renderTrendMarker(trendAndroidMarkers, androidValues, scale, showAndroidMarker, "#34d399");
    if (trendMax) trendMax.textContent = formatTick(scale.max);
    if (trendMid) trendMid.textContent = formatTick(mid);
    if (trendMin) trendMin.textContent = formatTick(scale.min);
    if (trendStart) trendStart.textContent = formatTrendAxisLabel(rows[0]?.date ?? "", trendRange);
    if (trendEnd) trendEnd.textContent = formatTrendAxisLabel(rows.at(-1)?.date ?? "", trendRange);
    trendRows = rows;
    clearTrendSelection(trendStatusAnnounce(rows));
    if (trendOverlay) trendOverlay.hidden = rows.length === 0;
  }
  function renderFailures(metrics) {
    if (!failuresList) return;
    failuresList.replaceChildren();
    const lead = metrics.failures[0];
    if (failuresLead) {
      if (lead) {
        const info = getBuilderFailureInfo(lead.reason);
        failuresLead.textContent = `${info.label} accounts for ${Math.ceil(lead.share)}% of failed jobs in this window.`;
      } else {
        failuresLead.textContent = "Normalized categories across all apps.";
      }
    }
    for (const [index, item] of metrics.failures.entries()) {
      const info = getBuilderFailureInfo(item.reason);
      const row = createScopedElement("li");
      const rank = createScopedElement("span");
      rank.textContent = String(index + 1).padStart(2, "0");
      const copy = createScopedElement("div");
      copy.className = "data-failure-copy";
      const reason = createScopedElement("strong");
      reason.textContent = info.label;
      const explanation = createScopedElement("p");
      explanation.textContent = info.explanation;
      copy.append(reason, explanation);
      const share = createScopedElement("b");
      share.textContent = `${Math.ceil(item.share)}%`;
      const track = createScopedElement("i");
      track.setAttribute("aria-hidden", "true");
      const fill = createScopedElement("em");
      fill.style.setProperty("--share", `${item.share}%`);
      track.append(fill);
      row.append(rank, copy, share, track);
      failuresList.append(row);
    }
    if (!metrics.failures.length) failuresList.append(Object.assign(createScopedElement("li"), { className: "data-empty", textContent: "No failures in this window." }));
  }
  function renderMetrics(metrics) {
    latestMetrics = metrics;
    const ios = platformOf(metrics, "ios");
    const android = platformOf(metrics, "android");
    if (successRateKpi) successRateKpi.textContent = formatRate(metrics.success_rate);
    if (processKpi) processKpi.textContent = formatDuration(metrics.avg_process_seconds);
    if (queueKpi) queueKpi.textContent = formatDuration(metrics.avg_queue_seconds);
    if (iosSuccessKpi) iosSuccessKpi.textContent = formatRate(ios.success_rate);
    if (iosFailureKpi) iosFailureKpi.textContent = formatRate(failureRate(ios.success_rate));
    if (androidSuccessKpi) androidSuccessKpi.textContent = formatRate(android.success_rate);
    if (androidFailureKpi) androidFailureKpi.textContent = formatRate(failureRate(android.success_rate));
    if (iosProcess) iosProcess.textContent = `${formatDuration(ios.avg_process_seconds)} avg process`;
    if (androidProcess) androidProcess.textContent = `${formatDuration(android.avg_process_seconds)} avg process`;
    if (iosTopFailure) iosTopFailure.textContent = ios.top_failure ? getBuilderFailureInfo(ios.top_failure.reason).label : "No leading failure";
    if (androidTopFailure) androidTopFailure.textContent = android.top_failure ? getBuilderFailureInfo(android.top_failure.reason).label : "No leading failure";
    if (statusBadge) {
      statusBadge.dataset.tone = "operational";
      if (statusBadge.lastChild) statusBadge.lastChild.textContent = " Operational";
    }
    if (kpiStatus) {
      kpiStatus.textContent = `Success ${formatRate(metrics.success_rate)}, process ${formatDuration(metrics.avg_process_seconds)}, queue ${formatDuration(metrics.avg_queue_seconds)}`;
    }
    const sparkRows = sliceSparklineRows(metrics.daily_platforms);
    renderSpark(iosSpark, sparkRows, "ios");
    renderSpark(androidSpark, sparkRows, "android");
    renderTrend(metrics);
    renderFailures(metrics);
    if (updated) {
      const timestamp = new Date(metrics.updated_at);
      updated.textContent = Number.isNaN(timestamp.getTime()) ? "Updated moments ago" : `Updated ${new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(timestamp)} UTC`;
    }
  }
  function renderUnavailable() {
    latestMetrics = null;
    if (updated) updated.textContent = "Builder data is temporarily unavailable. Check back shortly.";
    if (statusBadge) {
      statusBadge.dataset.tone = "unavailable";
      if (statusBadge.lastChild) statusBadge.lastChild.textContent = " Unavailable";
    }
    if (kpiStatus) kpiStatus.textContent = "Builder metrics unavailable";
    if (successRateKpi) successRateKpi.textContent = "\u2014";
    if (processKpi) processKpi.textContent = "\u2014";
    if (queueKpi) queueKpi.textContent = "\u2014";
    if (iosSuccessKpi) iosSuccessKpi.textContent = "\u2014";
    if (iosFailureKpi) iosFailureKpi.textContent = "\u2014";
    if (androidSuccessKpi) androidSuccessKpi.textContent = "\u2014";
    if (androidFailureKpi) androidFailureKpi.textContent = "\u2014";
    if (iosSpark) iosSpark.replaceChildren();
    if (androidSpark) androidSpark.replaceChildren();
    if (trendSvg) trendSvg.style.display = "none";
    if (failuresLead) failuresLead.textContent = "Failure data is temporarily unavailable.";
    if (failuresList) failuresList.replaceChildren(Object.assign(createScopedElement("li"), { className: "data-empty", textContent: "Failure data is temporarily unavailable." }));
  }
  async function fetchMetrics() {
    if (!endpoint) throw new Error("Missing metrics endpoint");
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 1e4);
    try {
      const response = await fetch(endpoint, {
        headers: { Accept: "application/json" },
        signal: controller.signal,
        cache: "default"
      });
      const payload = response.ok ? await response.json() : null;
      const metrics = normalizeBuilderMetrics(payload);
      if (!metrics) throw new Error("Invalid metrics response");
      writeCachedMetrics(payload);
      return metrics;
    } finally {
      window.clearTimeout(timeoutId);
    }
  }
  const METRICS_CACHE_KEY = "capgo-builder-metrics-v2";
  const METRICS_CACHE_FRESH_MS = 5 * 60 * 1e3;
  const METRICS_CACHE_STALE_MS = 24 * 60 * 60 * 1e3;
  function readCachedMetrics() {
    try {
      const raw = localStorage.getItem(METRICS_CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (typeof parsed.savedAt !== "number") return null;
      const age = Date.now() - parsed.savedAt;
      if (age > METRICS_CACHE_STALE_MS) return null;
      const metrics = normalizeBuilderMetrics(parsed.payload);
      if (!metrics) return null;
      return { metrics, fresh: age <= METRICS_CACHE_FRESH_MS };
    } catch {
      return null;
    }
  }
  function writeCachedMetrics(payload) {
    try {
      localStorage.setItem(METRICS_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), payload }));
    } catch {
    }
  }
  async function loadMetrics() {
    const cached = readCachedMetrics();
    const initial = cached?.metrics;
    if (initial) {
      renderMetrics(initial);
      page?.setAttribute("aria-busy", "false");
    }
    if (cached?.fresh) {
      void fetchMetrics().then((metrics) => renderMetrics(metrics)).catch(() => void 0);
      return;
    }
    try {
      const metrics = await fetchMetrics();
      renderMetrics(metrics);
    } catch {
      if (!initial) renderUnavailable();
    } finally {
      page?.setAttribute("aria-busy", "false");
    }
  }
  for (const button of trendRangeButtons) {
    button.addEventListener("click", () => {
      const next = button.dataset.trendRange;
      if (next !== "1d" && next !== "1w" && next !== "1m" && next !== "3m") return;
      trendRange = next;
      for (const item of trendRangeButtons) item.setAttribute("aria-pressed", item === button ? "true" : "false");
      if (latestMetrics) renderTrend(latestMetrics);
    });
  }
  for (const button of metricButtons) {
    button.addEventListener("click", () => {
      const next = button.dataset.metric;
      if (next !== "rate" && next !== "duration") return;
      metric = next;
      for (const item of metricButtons) item.ariaSelected = item === button ? "true" : "false";
      if (latestMetrics) renderTrend(latestMetrics);
    });
  }
  void loadMetrics();
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
else boot();
