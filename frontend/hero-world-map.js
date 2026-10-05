import { capgoRegions, worldMapCities, worldMapSize } from "./world-map.js";
const AZURE = [68, 188, 255];
const BASE_ALPHA = 0.14;
const SPOT_RADIUS = 150;
const LENS_PUSH = 9;
const SPOT_STRENGTH = 0.45;
const CITY_HIT = 3.4;
const LAND_REACH = 14;
const TRIP_MS = 1500;
const PING_LEG = 750;
const PING_HOLD = 4500;
const IDLE_MS = 4e3;
const TEXT_PAD_X = 10;
const TEXT_PAD_Y = 4;
const TEXT_FEATHER = 18;
const toRad = Math.PI / 180;
const distanceKm = (a, b) => {
  const dLat = (b.lat - a.lat) * toRad;
  const dLng = (b.lng - a.lng) * toRad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * toRad) * Math.cos(b.lat * toRad) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
};
const estimateMs = (km) => Math.max(3, Math.round(2 * km * 1.5 / 200 + 3));
const CAPGO_MS = 60;
const cityRoute = worldMapCities.map((city) => {
  const region = Math.max(
    0,
    capgoRegions.findIndex((r) => r.code === city.region)
  );
  const km = distanceKm(city, capgoRegions[region]);
  const network = estimateMs(km);
  return { region, km, network, ms: network + CAPGO_MS };
});
const root = document.querySelector("[data-hero-map]");
const canvas = root?.querySelector("canvas.map-live");
const hero = root?.closest("section");
if (root && canvas && hero) {
  let kick = function() {
    if (running || !ready) return;
    running = true;
    requestAnimationFrame(frame);
  };
  const ctx = canvas.getContext("2d");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const pinEls = Array.from(root.querySelectorAll("[data-pin]"));
  const hud = hero.querySelector("[data-map-hud]");
  const glowHost = hero.firstElementChild instanceof HTMLElement ? hero.firstElementChild : hero;
  const glow = document.createElement("div");
  glow.className = "map-glow";
  glow.setAttribute("aria-hidden", "true");
  glowHost.prepend(glow);
  let dots = new Float32Array(0);
  let scale = 1;
  let dpr = 1;
  let cssW = 0;
  let cssH = 0;
  let pageVisible = document.visibilityState === "visible";
  let inView = true;
  let visible = pageVisible;
  let running = false;
  let ready = false;
  const pointer = { clientX: 0, clientY: 0, inside: false };
  const eased = { x: 0, y: 0, presence: 0, primed: false };
  const ripples = [];
  const trips = [];
  let nextTrip = 0;
  let hoverCity = -1;
  let hoverSince = 0;
  let ping = null;
  let pinRegion = -1;
  let hudKey = "";
  let lastActivity = performance.now();
  let idleArmed = true;
  let touchHintUntil = 0;
  const normalize = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const tzAliases = { calcutta: "kolkata", kiev: "kyiv", saigon: "ho chi minh city", "ho chi minh": "ho chi minh city", rangoon: "yangon" };
  const tzCity = normalize((Intl.DateTimeFormat().resolvedOptions().timeZone || "").split("/").pop()?.replace(/_/g, " ") ?? "");
  let userCity = worldMapCities.findIndex((city) => normalize(city.name) === (tzAliases[tzCity] ?? tzCity));
  const locateVisitor = async () => {
    try {
      const trace = await (await fetch("/cdn-cgi/trace")).text();
      const colo = /^colo=([A-Z]{3})$/m.exec(trace)?.[1];
      const index = worldMapCities.findIndex((city) => city.colo === colo);
      if (index >= 0) {
        userCity = index;
        kick();
      }
    } catch {
    }
  };
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    cssW = rect.width;
    cssH = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    scale = cssW / worldMapSize.width;
    measureText();
    kick();
  };
  let textBoxes = [];
  const copy = hero.querySelector("[data-hero-copy]");
  const measureText = () => {
    if (!copy) return;
    const origin = canvas.getBoundingClientRect();
    const range = document.createRange();
    const boxes = [];
    for (const node of copy.querySelectorAll("h1, p, a")) {
      if (node.closest("[data-map-hud]")) continue;
      range.selectNodeContents(node);
      for (const line of range.getClientRects()) {
        if (!line.width || !line.height) continue;
        boxes.push({
          l: line.left - origin.left - TEXT_PAD_X,
          t: line.top - origin.top - TEXT_PAD_Y,
          r: line.right - origin.left + TEXT_PAD_X,
          b: line.bottom - origin.top + TEXT_PAD_Y
        });
      }
    }
    textBoxes = boxes;
  };
  const textMask = (x, y) => {
    let mask = 0;
    for (const box of textBoxes) {
      const d = Math.hypot(Math.max(box.l - x, 0, x - box.r), Math.max(box.t - y, 0, y - box.b));
      if (d < TEXT_FEATHER) mask = Math.max(mask, 1 - d / TEXT_FEATHER);
      if (mask === 1) break;
    }
    return mask;
  };
  const eraseUnderText = () => {
    if (!ctx || !textBoxes.length) return;
    const shift = cssW + TEXT_FEATHER * 4;
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.shadowColor = "#000";
    ctx.shadowBlur = TEXT_FEATHER * dpr;
    ctx.shadowOffsetX = shift * dpr;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    for (const box of textBoxes) ctx.rect(box.l - shift, box.t, box.r - box.l, box.b - box.t);
    ctx.fill();
    ctx.restore();
  };
  const localPointer = () => {
    const rect = canvas.getBoundingClientRect();
    return { x: pointer.clientX - rect.left, y: pointer.clientY - rect.top, rect };
  };
  const px = (point) => ({ x: point.x * scale, y: point.y * scale });
  const cityAt = (x, y, hit = CITY_HIT) => {
    const ux = x / scale;
    const uy = y / scale;
    let onLand = false;
    for (let i = 0; i < dots.length && !onLand; i += 2) onLand = Math.abs(dots[i] - ux) < 1.1 && Math.abs(dots[i + 1] - uy) < 1.1;
    let best = -1;
    let bestDist = onLand ? LAND_REACH : hit;
    worldMapCities.forEach((city, index) => {
      const d = Math.hypot(city.x - ux, city.y - uy);
      if (d < bestDist) {
        best = index;
        bestDist = d;
      }
    });
    return best;
  };
  const pingPhase = (now) => ping ? reducedMotion ? 1 : Math.min(1, (now - ping.start) / (PING_LEG * 2)) : 0;
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    node.className = className;
    node.textContent = text;
    return node;
  };
  const renderHud = (now) => {
    const focus = ping ? ping.city : hoverCity;
    const done = ping ? pingPhase(now) >= 1 : false;
    const hint = !ping && focus < 0 && (finePointer ? pointer.inside : now < touchHintUntil);
    const key = ping ? `${done ? "done" : "ping"}:${focus}:${ping.you}` : focus >= 0 ? `hover:${focus}` : hint ? "hint" : "";
    if (hud && key !== hudKey) {
      hudKey = key;
      hud.classList.toggle("is-visible", key !== "");
      if (key) {
        const parts = [];
        if (hint) parts.push(el("span", "map-hud-muted map-hud-text", finePointer ? "Click anywhere to get an update" : "Tap the map to get an update"));
        else {
          const city = worldMapCities[focus];
          const route = cityRoute[focus];
          parts.push(el("strong", "map-hud-text", ping?.you ? `You \xB7 ${city.name}` : city.name));
          if (!ping) parts.push(el("span", "map-hud-muted", finePointer ? "click to get an update" : "tap to get an update"));
          else {
            parts.push(el("span", "map-hud-text", `\u2192 Capgo ${capgoRegions[route.region].name}`));
            if (!done) parts.push(el("span", "map-hud-ms is-pending", "checking\u2026"));
            else
              parts.push(
                el("span", "map-hud-ms is-done", `~${route.ms} ms`),
                el("span", "map-hud-muted map-hud-note", `est. network ~${route.network} ms + Capgo ~${CAPGO_MS} ms \xB7 ${Math.round(route.km).toLocaleString("en-US")} km`)
              );
          }
        }
        const live = el("span", ping && !done ? "map-hud-dot is-busy" : "map-hud-dot", "");
        hud.replaceChildren(live, ...parts);
      }
    }
    const region = focus >= 0 ? cityRoute[focus].region : -1;
    if (region !== pinRegion) {
      pinEls[pinRegion]?.classList.remove("is-active");
      pinEls[region]?.classList.add("is-active");
      pinRegion = region;
    }
  };
  const startPing = (city, now, you, sticky) => {
    ping = { city, start: now, you, sticky };
    if (!reducedMotion) {
      const point = px(worldMapCities[city]);
      ripples.push({ x: point.x, y: point.y, start: now, reach: 90, strength: 0.7 });
    }
  };
  const arcPoint = (a, b, t) => {
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2 - Math.max(18, Math.hypot(b.x - a.x, b.y - a.y) * 0.3);
    const u = 1 - t;
    return { x: u * u * a.x + 2 * u * t * mx + t * t * b.x, y: u * u * a.y + 2 * u * t * my + t * t * b.y };
  };
  const drawArc = (a, b, head, tail, alpha, width = 1.25) => {
    if (!ctx || head <= 0) return;
    const steps = 28;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    let prev = arcPoint(a, b, Math.max(0, tail));
    for (let s = 1; s <= steps; s++) {
      const t = tail + (head - tail) * s / steps;
      if (t < 0) continue;
      const point = arcPoint(a, b, t);
      ctx.strokeStyle = `rgba(${AZURE[0]},${AZURE[1]},${AZURE[2]},${alpha * s / steps})`;
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
      prev = point;
    }
  };
  const drawPacket = (point, alpha) => {
    if (!ctx) return;
    const glow2 = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, 8);
    glow2.addColorStop(0, `rgba(255,255,255,${alpha})`);
    glow2.addColorStop(0.35, `rgba(${AZURE[0]},${AZURE[1]},${AZURE[2]},${alpha * 0.6})`);
    glow2.addColorStop(1, "rgba(68,188,255,0)");
    ctx.fillStyle = glow2;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
    ctx.fill();
  };
  const drawRoute = (a, b, head, strong) => {
    if (!ctx || head <= 0) return;
    const steps = 40;
    const path = () => {
      ctx.beginPath();
      for (let s = 0; s <= steps; s++) {
        const point = arcPoint(a, b, head * s / steps);
        if (s === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      }
    };
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    path();
    ctx.strokeStyle = `rgba(6,12,26,${strong ? 0.88 : 0.6})`;
    ctx.lineWidth = Math.max(6, scale * 0.75);
    ctx.stroke();
    path();
    ctx.strokeStyle = strong ? "rgba(214,240,255,0.95)" : "rgba(170,222,255,0.55)";
    ctx.lineWidth = strong ? 1.75 : 1.25;
    ctx.stroke();
  };
  const drawUpdatePacket = (point) => {
    if (!ctx) return;
    const glow2 = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, 16);
    glow2.addColorStop(0, `rgba(${AZURE[0]},${AZURE[1]},${AZURE[2]},0.55)`);
    glow2.addColorStop(1, "rgba(68,188,255,0)");
    ctx.fillStyle = glow2;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(6,12,26,0.9)";
    ctx.beginPath();
    ctx.arc(point.x, point.y, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
    ctx.fill();
  };
  const drawCityMarker = (point, since, now) => {
    if (!ctx) return;
    const pulse = reducedMotion ? 0.5 : (now - since) % 1400 / 1400;
    ctx.strokeStyle = `rgba(255,255,255,${0.8 * (1 - pulse)})`;
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4 + pulse * 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
    ctx.fill();
  };
  const spawnTrip = (now) => {
    const city = Math.floor(Math.random() * worldMapCities.length);
    if (cityRoute[city].km < 600) return;
    trips.push({ city, region: cityRoute[city].region, start: now, duration: TRIP_MS + Math.random() * 500 });
  };
  const frame = (now) => {
    running = false;
    if (!ctx || !ready) return;
    const { x: tx, y: ty } = localPointer();
    const presenceTarget = pointer.inside && finePointer ? 1 : 0;
    if (!eased.primed || reducedMotion) {
      eased.x = tx;
      eased.y = ty;
      eased.primed = true;
    } else {
      eased.x += (tx - eased.x) * 0.2;
      eased.y += (ty - eased.y) * 0.2;
    }
    eased.presence = reducedMotion ? presenceTarget : eased.presence + (presenceTarget - eased.presence) * 0.09;
    if (finePointer) {
      const next = pointer.inside ? cityAt(tx, ty) : -1;
      if (next !== hoverCity) {
        hoverCity = next;
        hoverSince = now;
      }
    }
    if (ping) {
      const doneAt = ping.start + (reducedMotion ? 0 : PING_LEG * 2);
      if (ping.sticky === "hover" ? hoverCity !== ping.city : now > doneAt + PING_HOLD) {
        if (ping.you && !finePointer) {
          touchHintUntil = now + 5e3;
          window.setTimeout(kick, 5050);
        }
        ping = null;
      }
    }
    if (!ping && idleArmed && userCity >= 0 && visible && now - lastActivity > IDLE_MS) {
      idleArmed = false;
      startPing(userCity, now, true, "timer");
    }
    renderHud(now);
    if (!reducedMotion && visible && now >= nextTrip) {
      spawnTrip(now);
      nextTrip = now + 900 + Math.random() * 900;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);
    const canvasRect = canvas.getBoundingClientRect();
    const glowRect = glow.getBoundingClientRect();
    glow.style.setProperty("--gx", `${Math.round(canvasRect.left - glowRect.left + eased.x)}px`);
    glow.style.setProperty("--gy", `${Math.round(canvasRect.top - glowRect.top + eased.y)}px`);
    glow.style.opacity = eased.presence.toFixed(3);
    for (let i = ripples.length - 1; i >= 0; i--) if (now - ripples[i].start > 1600) ripples.splice(i, 1);
    for (let i = trips.length - 1; i >= 0; i--) if (now - trips[i].start > trips[i].duration * 1.5) trips.splice(i, 1);
    const radius = 0.21 * scale;
    const spotScale = ping && pingPhase(now) < 1 ? 0.15 : SPOT_STRENGTH;
    const lit = [];
    const base = new Path2D();
    for (let i = 0; i < dots.length; i += 2) {
      const x = dots[i] * scale;
      const y = dots[i + 1] * scale;
      const dist = Math.hypot(x - eased.x, y - eased.y);
      let spot = 0;
      if (eased.presence > 0.01 && dist < SPOT_RADIUS) {
        const f = 1 - dist / SPOT_RADIUS;
        spot = f * f * (3 - 2 * f) * eased.presence * spotScale;
      }
      let wave = 0;
      for (const ripple of ripples) {
        const age = (now - ripple.start) / 1600;
        const band = (Math.hypot(x - ripple.x, y - ripple.y) - age * ripple.reach) / 22;
        wave += Math.exp(-band * band) * (1 - age) * ripple.strength;
      }
      let energy = Math.min(1, spot + wave);
      if (energy >= 0.02) {
        const keep = 1 - textMask(x, y);
        energy *= keep;
        spot *= keep;
      }
      if (energy < 0.02) {
        base.moveTo(x + radius, y);
        base.arc(x, y, radius, 0, Math.PI * 2);
      } else {
        lit.push(i, energy, spot, dist);
      }
    }
    for (let j = 0; j < lit.length; j += 4) {
      const i = lit[j];
      const energy = lit[j + 1];
      const spot = lit[j + 2];
      const dist = lit[j + 3];
      let x = dots[i] * scale;
      let y = dots[i + 1] * scale;
      if (!reducedMotion && spot > 0 && dist > 0.5) {
        const push = LENS_PUSH * spot * (dist / SPOT_RADIUS);
        x += (x - eased.x) / dist * push;
        y += (y - eased.y) / dist * push;
      }
      const r = Math.round(255 + (AZURE[0] - 255) * energy);
      const g = Math.round(255 + (AZURE[1] - 255) * energy);
      ctx.fillStyle = `rgba(${r},${g},255,${BASE_ALPHA + 0.8 * energy})`;
      ctx.beginPath();
      ctx.arc(x, y, radius * (1 + 0.9 * energy), 0, Math.PI * 2);
      ctx.fill();
    }
    for (const trip of trips) {
      const t = (now - trip.start) / trip.duration;
      const head = 1 - Math.pow(1 - Math.min(1, t), 3);
      const fade = t > 1 ? 1 - (t - 1) / 0.5 : 1;
      const a = px(worldMapCities[trip.city]);
      const b = px(capgoRegions[trip.region]);
      drawArc(a, b, head, head - 0.4, 0.6 * fade, 1);
      if (t < 1) drawPacket(arcPoint(a, b, head), 0.8);
      if (t >= 1 && !trip.landed) {
        trip.landed = true;
        ripples.push({ x: b.x, y: b.y, start: now, reach: 60, strength: 0.5 });
      }
    }
    if (ping) {
      const a = px(worldMapCities[ping.city]);
      const b = px(capgoRegions[cityRoute[ping.city].region]);
      const phase = pingPhase(now);
      drawRoute(a, b, 1, true);
      if (phase < 1) {
        const leg = phase < 0.5 ? phase * 2 : 2 - phase * 2;
        const t = leg * leg * (3 - 2 * leg);
        drawUpdatePacket(arcPoint(a, b, t));
      }
      if (phase >= 0.5 && !ping.landed) {
        ping.landed = true;
        if (!reducedMotion) ripples.push({ x: b.x, y: b.y, start: now, reach: 80, strength: 0.8 });
      }
      if (phase >= 1 && !ping.returned) {
        ping.returned = true;
        if (!reducedMotion) ripples.push({ x: a.x, y: a.y, start: now, reach: 520, strength: 0.9 });
      }
      drawCityMarker(a, ping.start, now);
    } else if (hoverCity >= 0) {
      const a = px(worldMapCities[hoverCity]);
      const b = px(capgoRegions[cityRoute[hoverCity].region]);
      const grow = reducedMotion ? 1 : Math.min(1, (now - hoverSince) / 450);
      drawRoute(a, b, 1 - Math.pow(1 - grow, 3), false);
      drawCityMarker(a, hoverSince, now);
    }
    eraseUnderText();
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = `rgba(255,255,255,${BASE_ALPHA})`;
    ctx.fill(base);
    ctx.globalCompositeOperation = "source-over";
    const busy = !reducedMotion && (visible || ripples.length > 0 || Math.abs(eased.presence - presenceTarget) > 5e-3 || Math.hypot(tx - eased.x, ty - eased.y) > 0.5);
    if ((busy || ping || idleArmed && userCity >= 0) && visible) kick();
  };
  const onMove = (event) => {
    pointer.clientX = event.clientX;
    pointer.clientY = event.clientY;
    pointer.inside = true;
    lastActivity = performance.now();
    idleArmed = true;
    kick();
  };
  const onLeave = () => {
    pointer.inside = false;
    kick();
  };
  const onDown = (event) => {
    if (event.target.closest('a, button, input, textarea, select, [role="button"]')) return;
    pointer.clientX = event.clientX;
    pointer.clientY = event.clientY;
    const now = performance.now();
    lastActivity = now;
    const { x, y } = localPointer();
    const city = cityAt(x, y, finePointer ? CITY_HIT : CITY_HIT * 1.6);
    if (city >= 0) startPing(city, now, false, finePointer ? "hover" : "timer");
    else if (!reducedMotion) ripples.push({ x, y, start: now, reach: 520, strength: 0.9 });
    kick();
  };
  const start = async () => {
    try {
      const svg = await (await fetch("/world-dots.svg")).text();
      const coords = [];
      for (const match of svg.matchAll(/M([\d.]+) ([\d.]+)h0/g)) coords.push(Number(match[1]), Number(match[2]));
      if (!coords.length) return;
      dots = Float32Array.from(coords);
    } catch {
      return;
    }
    ready = true;
    void locateVisitor();
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    if (copy) observer.observe(copy);
    void document.fonts?.ready.then(resize);
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      visible = pageVisible && inView;
      kick();
    }).observe(root);
    document.addEventListener("visibilitychange", () => {
      pageVisible = document.visibilityState === "visible";
      visible = pageVisible && inView;
      if (visible) kick();
    });
    hero.addEventListener("pointermove", onMove, { passive: true });
    hero.addEventListener("pointerleave", onLeave, { passive: true });
    hero.addEventListener("click", onDown, { passive: true });
    requestAnimationFrame(() => root.classList.add("is-live"));
  };
  if ("requestIdleCallback" in window) requestIdleCallback(() => start(), { timeout: 1500 });
  else setTimeout(start, 300);
}
