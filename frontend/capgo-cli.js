;
(function cliDemoTerminal() {
  const el = document.getElementById("demo-term-body");
  if (!el) return;
  let paused = false;
  let started = false;
  let gen = 0;
  let mode = "release";
  const SPINNER = ["\u280B", "\u2819", "\u2839", "\u2838", "\u283C", "\u2834", "\u2826", "\u2827", "\u2807", "\u280F"];
  const TITLES = {
    release: "npx @capgo/cli bundle releaseType",
    upload: "npx @capgo/cli bundle upload",
    build: "npx @capgo/cli build request"
  };
  const STATIC = {
    release: `<span class="dim">$ </span><span class="cmd">npx @capgo/cli@latest bundle releaseType</span> <span class="flag">com.acme.app</span> <span class="flag">--channel</span> <span class="val">production</span>
<span class="ok">\u2714</span> Channel: <span class="val">production</span>  \xB7  App: <span class="val">com.acme.app</span>
<span class="ok">Recommendation:</span> <span class="val">OTA update</span>
<span class="ghost">No native dependency drift detected for production.</span>

<span class="ok">\u2501\u2501\u2501 Safe to ship as a live update \u2501\u2501\u2501</span>`,
    upload: `<span class="dim">$ </span><span class="cmd">npx @capgo/cli@latest bundle upload</span> <span class="flag">--channel</span> <span class="val">production</span> <span class="flag">--fail-on-incompatible</span> <span class="flag">--qr-preview</span>
<span class="ok">\u2714</span> Compatibility gate passed
<span class="ok">\u2714</span> Bundle validated  \xB7  <span class="kw">2.1 MB</span>
<span class="ok">\u2714</span> Delta upload ready  \xB7  <span class="kw">340 KB</span>
<span class="ok">\u2714</span> Published to <span class="val">production</span>
<span class="lock">QR</span> Preview link generated for device testing

<span class="ok">\u2501\u2501\u2501 Live update rolling out \u2501\u2501\u2501</span>`,
    build: `<span class="dim">$ </span><span class="cmd">npx @capgo/cli@latest build request</span> <span class="flag">com.acme.app</span> <span class="flag">--platform</span> <span class="val">ios</span> <span class="flag">--output-record</span> <span class="val">.capgo/build.json</span>
<span class="ok">\u2714</span> Platform: <span class="val">iOS</span>  \xB7  Mode: <span class="val">release</span>
<span class="lock">\u{1F512}</span> <span class="ghost">Credentials used only during build, then deleted.</span>

<span class="ok">\u2714</span> Build job created  \xB7  job_id <span class="kw">9c4f7a</span>
<span class="ok">\u2714</span> Upload complete  \xB7  <span class="val">100%</span>
<span class="dim">[CapApp]</span> Archive succeeded
<span class="ok">\u2714</span> Output record saved  \xB7  <span class="val">.capgo/build.json</span>

<span class="ok">\u2501\u2501\u2501 Native build completed in 2m 41s \u2501\u2501\u2501</span>`
  };
  function makeScriptRelease() {
    return [
      {
        t: 0,
        html: `<span class="pain-prompt">$ </span><span class="cmd">npx @capgo/cli@latest bundle releaseType</span> <span class="flag">com.acme.app</span> <span class="flag">--channel</span> <span class="val">production</span><span class="terminal-cursor"></span>`
      },
      {
        t: 700,
        html: `<span class="pain-prompt">$ </span><span class="cmd">npx @capgo/cli@latest bundle releaseType</span> <span class="flag">com.acme.app</span> <span class="flag">--channel</span> <span class="val">production</span>
<span class="ok">\u2714</span> Channel: <span class="val">production</span>`,
        replaceAll: true
      },
      { t: 250, html: `
<span class="ok">\u2714</span> App: <span class="val">com.acme.app</span>` },
      { t: 350, html: `
<span class="ok">Recommendation:</span> <span class="val">OTA update</span>` },
      { t: 300, html: `
<span class="ghost">No native dependency drift detected for production.</span>` },
      { t: 400, html: `
` },
      { t: 300, html: `
<span class="ok">\u2501\u2501\u2501 Safe to ship as a live update \u2501\u2501\u2501</span>` }
    ];
  }
  function makeScriptUpload() {
    return [
      {
        t: 0,
        html: `<span class="pain-prompt">$ </span><span class="cmd">npx @capgo/cli@latest bundle upload</span> <span class="flag">--channel</span> <span class="val">production</span> <span class="flag">--fail-on-incompatible</span> <span class="flag">--qr-preview</span><span class="terminal-cursor"></span>`
      },
      {
        t: 700,
        html: `<span class="pain-prompt">$ </span><span class="cmd">npx @capgo/cli@latest bundle upload</span> <span class="flag">--channel</span> <span class="val">production</span> <span class="flag">--fail-on-incompatible</span> <span class="flag">--qr-preview</span>
<span class="ok">\u2714</span> Compatibility gate passed`,
        replaceAll: true
      },
      { kind: "spin", label: "Validating bundle", ms: 900, done: `<span class="ok">\u2714</span> Bundle validated  \xB7  <span class="kw">2.1 MB</span>` },
      { kind: "progress", label: "Uploading delta", size: "340 KB" },
      { t: 250, html: `
<span class="ok">\u2714</span> Published to <span class="val">production</span>` },
      { t: 250, html: `
<span class="lock">QR</span> Preview link generated for device testing` },
      { t: 350, html: `
` },
      { t: 300, html: `
<span class="ok">\u2501\u2501\u2501 Live update rolling out \u2501\u2501\u2501</span>` }
    ];
  }
  function makeScriptBuild() {
    return [
      {
        t: 0,
        html: `<span class="pain-prompt">$ </span><span class="cmd">npx @capgo/cli@latest build request</span> <span class="flag">com.acme.app</span> <span class="flag">--platform</span> <span class="val">ios</span> <span class="flag">--output-record</span> <span class="val">.capgo/build.json</span><span class="terminal-cursor"></span>`
      },
      {
        t: 700,
        html: `<span class="pain-prompt">$ </span><span class="cmd">npx @capgo/cli@latest build request</span> <span class="flag">com.acme.app</span> <span class="flag">--platform</span> <span class="val">ios</span> <span class="flag">--output-record</span> <span class="val">.capgo/build.json</span>
<span class="ok">\u2714</span> Platform: <span class="val">iOS</span>`,
        replaceAll: true
      },
      { t: 250, html: `
<span class="ok">\u2714</span> Mode: <span class="val">release</span>` },
      { t: 300, html: `
<span class="lock">\u{1F512}</span> <span class="ghost">Credentials used only during build, then deleted.</span>` },
      { t: 350, html: `
` },
      { t: 200, html: `
<span class="ok">\u2714</span> Build job created  \xB7  job_id <span class="kw">9c4f7a</span>` },
      { kind: "progress", label: "Uploading project", size: "12.4 MB" },
      { t: 220, html: `
<span class="dim">[CapApp]</span> Archive succeeded` },
      { t: 280, html: `
<span class="ok">\u2714</span> Output record saved  \xB7  <span class="val">.capgo/build.json</span>` },
      { t: 350, html: `
` },
      { t: 300, html: `
<span class="ok">\u2501\u2501\u2501 Native build completed in 2m 41s \u2501\u2501\u2501</span>` }
    ];
  }
  function makeScript() {
    if (mode === "upload") return makeScriptUpload();
    if (mode === "build") return makeScriptBuild();
    return makeScriptRelease();
  }
  let buf = "";
  let timer = null;
  let stepIdx = 0;
  let script = makeScript();
  function render() {
    el.innerHTML = buf;
    el.scrollTop = el.scrollHeight;
  }
  function restart() {
    gen++;
    const myGen = gen;
    if (timer) clearTimeout(timer);
    buf = "";
    stepIdx = 0;
    script = makeScript();
    render();
    setTimeout(() => {
      if (myGen === gen) next();
    }, 50);
  }
  function staticFallback() {
    el.innerHTML = STATIC[mode];
  }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    staticFallback();
    bindTabs(staticFallback);
    return;
  }
  function runSpin(label, doneHtml, ms, onDone) {
    let frame = 0;
    let elapsed = 0;
    const startBuf = buf;
    const myGen = gen;
    function tick() {
      if (myGen !== gen) return;
      if (paused) {
        timer = setTimeout(tick, 100);
        return;
      }
      const sp = SPINNER[frame % SPINNER.length];
      buf = startBuf + `
<span class="kw">${sp}</span> ${label}\u2026`;
      render();
      frame++;
      elapsed += 80;
      if (elapsed >= ms) {
        buf = startBuf + `
${doneHtml}`;
        render();
        onDone();
      } else {
        timer = setTimeout(tick, 80);
      }
    }
    tick();
  }
  function runSpinner(label, size, onDone) {
    let pct = 0;
    let frame = 0;
    const startBuf = buf;
    const myGen = gen;
    function tick() {
      if (myGen !== gen) return;
      if (paused) {
        timer = setTimeout(tick, 100);
        return;
      }
      const sp = SPINNER[frame % SPINNER.length];
      const shown = Math.min(100, Math.round(pct));
      const filled = Math.round(shown * 24 / 100);
      const bar = "\u2588".repeat(filled) + "\u2591".repeat(24 - filled);
      buf = startBuf + `
<span class="kw">${sp}</span> ${label}  <span class="dim">[</span><span class="val">${bar}</span><span class="dim">]</span>  <span class="val">${shown}%</span>`;
      render();
      frame++;
      pct += Math.max(1.6, (100 - pct) * 0.12);
      if (pct >= 99.5) {
        buf = startBuf + `
<span class="ok">\u2714</span> Upload complete  \xB7  <span class="val">${size} / ${size}</span>`;
        render();
        onDone();
      } else {
        timer = setTimeout(tick, 55);
      }
    }
    tick();
  }
  function next() {
    const myGen = gen;
    if (paused) {
      timer = setTimeout(() => {
        if (myGen === gen) next();
      }, 150);
      return;
    }
    if (stepIdx >= script.length) return;
    const s = script[stepIdx++];
    if ("kind" in s && s.kind === "progress") {
      runSpinner(s.label || "Uploading", s.size || "12.4 MB", () => {
        if (myGen === gen) next();
      });
      return;
    }
    if ("kind" in s && s.kind === "spin") {
      runSpin(s.label || "Working", s.done || "", s.ms || 1e3, () => {
        if (myGen === gen) next();
      });
      return;
    }
    timer = setTimeout(() => {
      if (myGen !== gen) return;
      if ("replaceAll" in s && s.replaceAll) buf = s.html;
      else buf += s.html ?? "";
      render();
      next();
    }, s.t || 100);
  }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) paused = true;
    else {
      const r = el.getBoundingClientRect();
      if (r.bottom > 0 && r.top < (window.innerHeight || 0)) paused = false;
    }
  });
  const replay = document.getElementById("demo-replay");
  if (replay) replay.addEventListener("click", restart);
  function bindTabs(onSwitch) {
    const tabRelease = document.getElementById("demo-tab-release");
    const tabUpload = document.getElementById("demo-tab-upload");
    const tabBuild = document.getElementById("demo-tab-build");
    const title = document.getElementById("demo-term-title");
    function setMode(nextMode) {
      if (nextMode === mode) return;
      mode = nextMode;
      tabRelease?.classList.toggle("active", nextMode === "release");
      tabUpload?.classList.toggle("active", nextMode === "upload");
      tabBuild?.classList.toggle("active", nextMode === "build");
      if (title) title.textContent = TITLES[nextMode];
      onSwitch();
    }
    tabRelease?.addEventListener("click", () => setMode("release"));
    tabUpload?.addEventListener("click", () => setMode("upload"));
    tabBuild?.addEventListener("click", () => setMode("build"));
  }
  bindTabs(restart);
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          paused = false;
          if (!started) {
            started = true;
            const myGen = gen;
            setTimeout(() => {
              if (myGen === gen) next();
            }, 300);
          }
        } else {
          paused = true;
        }
      });
    },
    { threshold: 0.25 }
  );
  io.observe(el);
})();
