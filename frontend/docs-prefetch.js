// Maintained vanilla runtime recovered from pinned production output. Standalone link prefetch DOM controller.
var m = {}, d = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new WeakSet(), f = true, h = void 0, l = false;
function g(e) {
  l || (l = true, f ??= e?.prefetchAll ?? false, h ??= e?.defaultStrategy ?? "hover", p(), y(), w(), L());
}
function p() {
  for (const e of ["touchstart", "mousedown"]) document.addEventListener(e, (t) => {
    const n = t.target.closest("a");
    i(n, "tap") && s(n.href, { ignoreSlowConnection: true });
  }, { passive: true });
}
function y() {
  let e;
  document.body.addEventListener("focusin", (r) => {
    const o = r.target.closest("a");
    i(o, "hover") && t(o.href);
  }, { passive: true }), document.body.addEventListener("focusout", n, { passive: true }), u(() => {
    for (const r of document.getElementsByTagName("a")) c.has(r) || i(r, "hover") && (c.add(r), r.addEventListener("mouseenter", (o) => t(o.currentTarget.href), { passive: true }), r.addEventListener("mouseleave", n, { passive: true }));
  });
  function t(r) {
    e && clearTimeout(e), e = setTimeout(() => {
      s(r);
    }, 80);
  }
  function n() {
    e && (clearTimeout(e), e = 0);
  }
}
function w() {
  let e;
  u(() => {
    for (const t of document.getElementsByTagName("a")) c.has(t) || i(t, "viewport") && (c.add(t), e ??= S(), e.observe(t));
  });
}
function S() {
  const e = /* @__PURE__ */ new WeakMap();
  return new IntersectionObserver((t, n) => {
    for (const r of t) {
      const o = r.target, a = e.get(o);
      r.isIntersecting ? (a && clearTimeout(a), e.set(o, setTimeout(() => {
        n.unobserve(o), e.delete(o), s(o.href);
      }, 300))) : a && (clearTimeout(a), e.delete(o));
    }
  });
}
function L() {
  u(() => {
    for (const e of document.getElementsByTagName("a")) i(e, "load") && s(e.href);
  });
}
function s(e, t) {
  e = e.replace(/#.*/, "");
  const n = t?.ignoreSlowConnection ?? false;
  if (b(e, n)) if (d.add(e), document.createElement("link").relList?.supports?.("prefetch")) {
    const r = document.createElement("link");
    r.rel = "prefetch", r.setAttribute("href", e), document.head.append(r);
  } else {
    const r = new Headers();
    for (const [o, a] of Object.entries(m)) r.set(o, a);
    fetch(e, { priority: "low", headers: r }).catch(() => {
    });
  }
}
function b(e, t) {
  if (!navigator.onLine || !t && v()) return false;
  try {
    const n = new URL(e, location.href);
    return location.origin === n.origin && (location.pathname !== n.pathname || location.search !== n.search) && !d.has(e);
  } catch {
  }
  return false;
}
function i(e, t) {
  if (e?.tagName !== "A") return false;
  const n = e.dataset.astroPrefetch;
  return n === "false" ? false : t === "tap" && (n != null || f) && v() ? true : n == null && f || n === "" ? t === h : n === t;
}
function v() {
  if ("connection" in navigator) {
    const e = navigator.connection;
    return e.saveData || /2g/.test(e.effectiveType);
  }
  return false;
}
function u(e) {
  e();
  let t = false;
  document.addEventListener("astro:page-load", () => {
    if (!t) {
      t = true;
      return;
    }
    e();
  }), new MutationObserver((n) => {
    for (const r of n) for (const o of r.addedNodes) if (o instanceof Element && (o.tagName === "A" || o.querySelector?.("a"))) {
      e();
      return;
    }
  }).observe(document.body, { childList: true, subtree: true });
}
g();
