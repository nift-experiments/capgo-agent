// Cap-go/website 7d5b69d, AGPL-3.0. Maintained vanilla browser source.
import { getFailureReasonInfo } from "./recovered/lib/liveUpdateFailureReasons.js";
import { normalizeLiveUpdateMetrics } from "./recovered/lib/liveUpdateMetrics.js";
import {
  formatTrendAxisLabel,
  formatTrendTooltip,
  selectTrendRows,
  sliceSparklineRows,
  trendHitLeftPercent,
  trendNearestIndex,
  trendRowUnit
} from "./recovered/lib/metricsTrendChart.js";
function boot() {
  const page = document.querySelector(".data-page");
  const endpoint = page?.dataset.metricsEndpoint;
  const updated = page?.querySelector("[data-updated]");
  const successRateKpi = page?.querySelector('[data-kpi="success-rate"]');
  const firstTryKpi = page?.querySelector('[data-kpi="first-try"]');
  const rollbackKpi = page?.querySelector('[data-kpi="rollback"]');
  const iosSuccessKpi = page?.querySelector('[data-kpi="ios-success"]');
  const iosFailureKpi = page?.querySelector('[data-kpi="ios-failure"]');
  const androidSuccessKpi = page?.querySelector('[data-kpi="android-success"]');
  const androidFailureKpi = page?.querySelector('[data-kpi="android-failure"]');
  const zipSuccessKpi = page?.querySelector('[data-kpi="zip-success"]');
  const zipFailureKpi = page?.querySelector('[data-kpi="zip-failure"]');
  const deltaSuccessKpi = page?.querySelector('[data-kpi="delta-success"]');
  const deltaFailureKpi = page?.querySelector('[data-kpi="delta-failure"]');
  const packagesStatus = page?.querySelector("[data-packages-status]");
  const kpiStatus = page?.querySelector("[data-kpi-status]");
  const dailyStatus = page?.querySelector("[data-daily-status]");
  const dailySkeleton = page?.querySelector("[data-daily-skeleton]");
  const dailyEmpty = page?.querySelector("[data-daily-empty]");
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
  const trendRangeButtons = [...page?.querySelectorAll("[data-trend-range]") ?? []];
  const iosSpark = page?.querySelector('[data-spark="ios"]');
  const androidSpark = page?.querySelector('[data-spark="android"]');
  const iosTopFailure = page?.querySelector('[data-top-failure="ios"]');
  const androidTopFailure = page?.querySelector('[data-top-failure="android"]');
  const statusBadge = page?.querySelector("[data-status-badge]");
  const failuresList = page?.querySelector("[data-failures]");
  const failuresLead = page?.querySelector("[data-failures-lead]");
  const failuresStatus = page?.querySelector("[data-failures-status]");
  const countriesBody = page?.querySelector("[data-countries]");
  const countriesEmpty = page?.querySelector("[data-countries-empty]");
  const countriesStatus = page?.querySelector("[data-countries-status]");
  const platformsBody = page?.querySelector("[data-platforms]");
  const platformsEmpty = page?.querySelector("[data-platforms-empty]");
  const platformsStatus = page?.querySelector("[data-platforms-status]");
  const shareEmpty = page?.querySelector("[data-share-empty]");
  const shareStatus = page?.querySelector("[data-share-status]");
  const versionsBody = page?.querySelector("[data-versions]");
  const versionEmpty = page?.querySelector("[data-version-empty]");
  const versionsStatus = page?.querySelector("[data-versions-status]");
  let trendRange = "1m";
  let latestMetrics = null;
  const styleScopeAttributes = page?.getAttributeNames().filter((attribute) => attribute.startsWith("data-astro-cid-")) ?? [];
  const countryNames = typeof Intl !== "undefined" && "DisplayNames" in Intl ? new Intl.DisplayNames(["en"], { type: "region" }) : null;
  function createScopedElement(tag) {
    const element = document.createElement(tag);
    for (const attribute of styleScopeAttributes) element.setAttribute(attribute, "");
    return element;
  }
  function labelForKey(kind, key) {
    if (kind === "platform") {
      if (key === "ios") return "iOS";
      if (key === "android") return "Android";
      if (key === "electron") return "Electron";
    }
    if (kind === "country") {
      try {
        return countryNames?.of(key.toUpperCase()) ?? key.toUpperCase();
      } catch {
        return key.toUpperCase();
      }
    }
    return key;
  }
  function formatPct(value) {
    return value === null ? "\u2014" : `${Math.ceil(value)}%`;
  }
  function formatRate(value) {
    return value === null ? "\u2014" : `${Number(value.toFixed(1))}%`;
  }
  function failureRate(success) {
    return success === null ? null : Number((100 - success).toFixed(1));
  }
  function sparkTone(rate) {
    if (rate === null) return "empty";
    return rate >= 60 ? "good" : "poor";
  }
  function sparkTip(date, rate) {
    return `${date}: ${formatRate(rate)}`;
  }
  function trendTip(date, ios, android) {
    return formatTrendTooltip(date, ios, android, formatRate);
  }
  let trendRows = [];
  let trendFocusIndex = -1;
  const trendOverlayLabel = "Install success trend values. Move pointer across the chart or use arrow keys.";
  function sparklineRows(metrics) {
    return metrics.daily_platforms_sparkline.length ? metrics.daily_platforms_sparkline : sliceSparklineRows(metrics.daily_platforms);
  }
  function clampTrendTooltip(leftPercent) {
    return Math.max(8, Math.min(92, leftPercent));
  }
  function clearTrendSelection() {
    trendFocusIndex = -1;
    if (trendTooltip) trendTooltip.hidden = true;
    if (trendGuide) trendGuide.hidden = true;
    if (trendStatus) trendStatus.textContent = "";
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
    const tooltip = trendTip(row.date, row.ios, row.android);
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
    return metrics.platforms.find((item) => item.key === key) ?? { key, share: 0, success_rate: null, top_failure: null };
  }
  function chartScale(rows) {
    const values = rows.flatMap((row) => [row.ios, row.android]).filter((value) => value !== null);
    if (!values.length) return { min: 0, max: 100 };
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = Math.max(3, (max - min) * 0.25);
    return { min: Math.max(0, Number((min - pad).toFixed(1))), max: Math.min(100, Number((max + pad).toFixed(1))) };
  }
  function chartPoints(rows, key, scale, width = 800, height = 260) {
    const pad = { l: 44, r: 16, t: 16, b: 28 };
    const innerW = width - pad.l - pad.r;
    const innerH = height - pad.t - pad.b;
    const span = Math.max(scale.max - scale.min, 1);
    return rows.map((row, index) => {
      const rate = row[key];
      if (rate === null) return null;
      const x = pad.l + (rows.length <= 1 ? innerW / 2 : index / (rows.length - 1) * innerW);
      const y = pad.t + (1 - (rate - scale.min) / span) * innerH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).filter((point) => point !== null).join(" ");
  }
  function renderBreakdownRows(body, empty, status, rows, kind, emptyText, statusLabel) {
    if (!body) return;
    body.replaceChildren();
    for (const item of rows) {
      const tr = createScopedElement("tr");
      const name = createScopedElement("th");
      name.scope = "row";
      name.textContent = labelForKey(kind, item.key);
      const usage = createScopedElement("td");
      usage.textContent = formatPct(item.share);
      const success = createScopedElement("td");
      success.textContent = formatPct(item.success_rate);
      if (item.success_rate !== null) {
        success.dataset.tone = item.success_rate >= 85 ? "good" : item.success_rate >= 70 ? "ok" : "poor";
      }
      const failure = createScopedElement("td");
      if (item.top_failure) {
        const info = getFailureReasonInfo(item.top_failure.reason);
        failure.textContent = `${info.label} (${Math.ceil(item.top_failure.share)}%)`;
        failure.title = info.explanation;
      } else {
        failure.textContent = "\u2014";
      }
      tr.append(name, usage, success, failure);
      body.append(tr);
    }
    if (empty) {
      empty.hidden = rows.length > 0;
      empty.textContent = emptyText;
    }
    if (status) {
      status.textContent = rows.length ? `${statusLabel} updated with ${rows.length} rows` : emptyText;
    }
  }
  function renderTrendMarker(group, rows, key, scale, show, fill) {
    if (!group) return;
    group.replaceChildren();
    if (!show) return;
    const coords = chartPoints(rows, key, scale);
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
    const scale = chartScale(rows);
    if (trendIos) trendIos.setAttribute("points", chartPoints(rows, "ios", scale));
    if (trendAndroid) trendAndroid.setAttribute("points", chartPoints(rows, "android", scale));
    const showIosMarker = rows.filter((row) => row.ios !== null).length === 1;
    const showAndroidMarker = rows.filter((row) => row.android !== null).length === 1;
    renderTrendMarker(trendIosMarkers, rows, "ios", scale, showIosMarker, "#60a5fa");
    renderTrendMarker(trendAndroidMarkers, rows, "android", scale, showAndroidMarker, "#34d399");
    if (trendMax) trendMax.textContent = formatRate(scale.max);
    if (trendMid) trendMid.textContent = formatRate(Number(((scale.min + scale.max) / 2).toFixed(1)));
    if (trendMin) trendMin.textContent = formatRate(scale.min);
    if (trendStart) trendStart.textContent = formatTrendAxisLabel(rows[0]?.date ?? "", trendRange);
    if (trendEnd) trendEnd.textContent = formatTrendAxisLabel(rows.at(-1)?.date ?? "", trendRange);
    if (trendSvg) trendSvg.style.display = rows.length ? "" : "none";
    if (dailySkeleton) dailySkeleton.hidden = rows.length > 0;
    if (dailyEmpty) {
      dailyEmpty.hidden = rows.length > 0;
      dailyEmpty.textContent = "Success-rate data is temporarily unavailable.";
    }
    if (dailyStatus) {
      const unit = trendRowUnit(rows, trendRange);
      dailyStatus.textContent = rows.length ? `Install success trend updated with ${rows.length} ${unit}${rows.length === 1 ? "" : "s"}` : "Install success trend unavailable";
    }
    trendRows = rows;
    clearTrendSelection();
    if (trendOverlay) trendOverlay.hidden = rows.length === 0;
  }
  function renderPlatformCards(metrics) {
    const ios = platformOf(metrics, "ios");
    const android = platformOf(metrics, "android");
    if (iosSuccessKpi) iosSuccessKpi.textContent = formatRate(ios.success_rate);
    if (iosFailureKpi) iosFailureKpi.textContent = formatRate(failureRate(ios.success_rate));
    if (androidSuccessKpi) androidSuccessKpi.textContent = formatRate(android.success_rate);
    if (androidFailureKpi) androidFailureKpi.textContent = formatRate(failureRate(android.success_rate));
    if (iosTopFailure) iosTopFailure.textContent = ios.top_failure ? getFailureReasonInfo(ios.top_failure.reason).label : "No leading failure";
    if (androidTopFailure) androidTopFailure.textContent = android.top_failure ? getFailureReasonInfo(android.top_failure.reason).label : "No leading failure";
    const sparkRows = sparklineRows(metrics);
    renderSpark(iosSpark, sparkRows, "ios");
    renderSpark(androidSpark, sparkRows, "android");
    if (platformsEmpty) {
      platformsEmpty.hidden = Boolean(ios.success_rate !== null || android.success_rate !== null || metrics.daily_platforms.length);
      platformsEmpty.textContent = "Platform breakdown is temporarily unavailable.";
    }
    if (platformsStatus) {
      platformsStatus.textContent = `iOS ${formatRate(ios.success_rate)}, Android ${formatRate(android.success_rate)}`;
    }
  }
  function renderFailures(metrics) {
    if (!failuresList) return;
    failuresList.replaceChildren();
    const lead = metrics.failures[0];
    if (failuresLead) {
      if (lead) {
        const info = getFailureReasonInfo(lead.reason);
        failuresLead.textContent = `${info.label} accounts for ${Math.ceil(lead.share)}% of failures in this window.`;
      } else {
        failuresLead.textContent = "Normalized categories across all apps.";
      }
    }
    if (failuresStatus) {
      failuresStatus.textContent = metrics.failures.length ? `Top failure reasons updated with ${metrics.failures.length} categories` : "No failures in this window";
    }
    for (const [index, item] of metrics.failures.entries()) {
      const info = getFailureReasonInfo(item.reason);
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
      share.textContent = formatPct(item.share);
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
    if (successRateKpi) successRateKpi.textContent = formatRate(metrics.success_rate);
    if (firstTryKpi) firstTryKpi.textContent = formatRate(metrics.first_try_rate);
    if (rollbackKpi) rollbackKpi.textContent = formatRate(metrics.rollback_rate);
    if (zipSuccessKpi) zipSuccessKpi.textContent = formatRate(metrics.zip_success_rate);
    if (zipFailureKpi) zipFailureKpi.textContent = formatRate(failureRate(metrics.zip_success_rate));
    if (deltaSuccessKpi) deltaSuccessKpi.textContent = formatRate(metrics.delta_success_rate);
    if (deltaFailureKpi) deltaFailureKpi.textContent = formatRate(failureRate(metrics.delta_success_rate));
    if (packagesStatus) {
      packagesStatus.textContent = `Zip success ${formatRate(metrics.zip_success_rate)}, delta success ${formatRate(metrics.delta_success_rate)}`;
    }
    if (kpiStatus) kpiStatus.textContent = `Success rate updated to ${formatRate(metrics.success_rate)}`;
    if (statusBadge) {
      statusBadge.dataset.tone = "operational";
      if (statusBadge.lastChild) statusBadge.lastChild.textContent = " Operational";
    }
    renderPlatformCards(metrics);
    renderTrend(metrics);
    renderFailures(metrics);
    renderBreakdownRows(countriesBody, countriesEmpty, countriesStatus, metrics.countries, "country", "Country breakdown is temporarily unavailable.", "Country breakdown");
    renderBreakdownRows(platformsBody, shareEmpty, shareStatus, metrics.platforms, "platform", "Platform breakdown is temporarily unavailable.", "Platform breakdown");
    renderBreakdownRows(versionsBody, versionEmpty, versionsStatus, metrics.updater_versions, "version", "Updater breakdown is temporarily unavailable.", "Updater versions");
    if (updated) {
      const timestamp = new Date(metrics.updated_at);
      updated.textContent = Number.isNaN(timestamp.getTime()) ? "Updated moments ago" : `Updated ${new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(timestamp)} UTC`;
    }
  }
  function renderUnavailable() {
    latestMetrics = null;
    if (updated) updated.textContent = "Delivery data is temporarily unavailable. Check back shortly.";
    if (statusBadge) {
      statusBadge.dataset.tone = "unavailable";
      if (statusBadge.lastChild) statusBadge.lastChild.textContent = " Unavailable";
    }
    if (trendSvg) trendSvg.style.display = "none";
    if (dailySkeleton) dailySkeleton.hidden = true;
    if (dailyEmpty) {
      dailyEmpty.hidden = false;
      dailyEmpty.textContent = "Success-rate data is temporarily unavailable.";
    }
    if (failuresList) failuresList.replaceChildren(Object.assign(createScopedElement("li"), { className: "data-empty", textContent: "Failure data is temporarily unavailable." }));
    if (failuresLead) failuresLead.textContent = "Failure data is temporarily unavailable.";
    if (failuresStatus) failuresStatus.textContent = "Failure data is temporarily unavailable.";
    if (kpiStatus) kpiStatus.textContent = "Success rate unavailable";
    if (successRateKpi) successRateKpi.textContent = "\u2014";
    if (firstTryKpi) firstTryKpi.textContent = "\u2014";
    if (rollbackKpi) rollbackKpi.textContent = "\u2014";
    if (iosSuccessKpi) iosSuccessKpi.textContent = "\u2014";
    if (iosFailureKpi) iosFailureKpi.textContent = "\u2014";
    if (androidSuccessKpi) androidSuccessKpi.textContent = "\u2014";
    if (androidFailureKpi) androidFailureKpi.textContent = "\u2014";
    if (zipSuccessKpi) zipSuccessKpi.textContent = "\u2014";
    if (zipFailureKpi) zipFailureKpi.textContent = "\u2014";
    if (deltaSuccessKpi) deltaSuccessKpi.textContent = "\u2014";
    if (deltaFailureKpi) deltaFailureKpi.textContent = "\u2014";
    if (iosSpark) iosSpark.replaceChildren();
    if (androidSpark) androidSpark.replaceChildren();
    if (packagesStatus) packagesStatus.textContent = "Zip vs delta success unavailable";
    if (dailyStatus) dailyStatus.textContent = "Install success trend unavailable";
    if (platformsEmpty) {
      platformsEmpty.hidden = false;
      platformsEmpty.textContent = "Platform breakdown is temporarily unavailable.";
    }
    renderBreakdownRows(countriesBody, countriesEmpty, countriesStatus, [], "country", "Country breakdown is temporarily unavailable.", "Country breakdown");
    renderBreakdownRows(platformsBody, shareEmpty, shareStatus, [], "platform", "Platform breakdown is temporarily unavailable.", "Platform breakdown");
    renderBreakdownRows(versionsBody, versionEmpty, versionsStatus, [], "version", "Updater breakdown is temporarily unavailable.", "Updater versions");
  }
  const METRICS_CACHE_KEY = "capgo-live-update-metrics-v7";
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
      const metrics = normalizeLiveUpdateMetrics(parsed.payload);
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
      const metrics = normalizeLiveUpdateMetrics(payload);
      if (!metrics) throw new Error("Invalid metrics response");
      writeCachedMetrics(payload);
      return metrics;
    } finally {
      window.clearTimeout(timeoutId);
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
  void loadMetrics();
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
else boot();
