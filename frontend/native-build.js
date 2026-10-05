;
(function mcpClientSelector() {
  const tabs = Array.from(document.querySelectorAll("button.mcp-ed[data-client]"));
  const panels = Array.from(document.querySelectorAll(".mcp-config-panel[data-client]"));
  if (!tabs.length || !panels.length) return;
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const id = tab.getAttribute("data-client");
      tabs.forEach((t) => {
        const on = t === tab;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-pressed", on ? "true" : "false");
      });
      panels.forEach((p) => {
        p.hidden = p.getAttribute("data-client") !== id;
      });
    });
  });
})();
(function mcpCopyButtons() {
  document.querySelectorAll(".mcp-copy").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = btn.getAttribute("data-copy") || "";
      try {
        await navigator.clipboard.writeText(text);
      } catch (e) {
      }
      const isIcon = btn.classList.contains("mcp-copy--icon");
      const prev = btn.textContent;
      btn.classList.add("copied");
      if (!isIcon) btn.textContent = btn.getAttribute("data-copied") || "Copied";
      setTimeout(() => {
        btn.classList.remove("copied");
        if (!isIcon) btn.textContent = prev;
      }, 1400);
    });
  });
})();
(function reliefTerminal() {
  const el = document.getElementById("demo-term-body");
  if (!el) return;
  let paused = false;
  let started = false;
  let gen = 0;
  let platform = "ios";
  const SPINNER = ["\u280B", "\u2819", "\u2839", "\u2838", "\u283C", "\u2834", "\u2826", "\u2827", "\u2807", "\u280F"];
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
  const STATIC_IOS = `
<span class="dim">$ </span><span class="cmd">capgo build request</span> <span class="flag">--platform</span> <span class="val">ios</span>
<span class="ok">\u2714</span> Platform: <span class="val">iOS</span>  \xB7  App: <span class="val">com.acme.app</span>
<span class="lock">\u{1F512}</span> <span class="ghost">Credentials never stored on Capgo servers. Used only during build, then deleted.</span>

<span class="ok">\u2714</span> Build job created  \xB7  job_id <span class="kw">9c4f7a</span>
<span class="ok">\u2714</span> Project zipped  \xB7  <span class="kw">12.4 MB</span>
<span class="ok">\u2714</span> Upload complete  \xB7  <span class="val">100%</span>

<span class="dim">[CapApp]</span> Compiling AppDelegate.swift
<span class="dim">[CapApp]</span> Compiling ContentView.swift
<span class="dim">[CapApp]</span> Compiling NotificationService.swift  <span class="ghost">(extension)</span>
<span class="dim">[CapApp]</span> Linking App.framework
<span class="dim">[CapApp]</span> Signing main + 2 extensions
<span class="dim">[CapApp]</span> Creating App.xcarchive
<span class="ok">\u2714</span> Archive Succeeded
<span class="ok">\u2714</span> Successfully uploaded to App Store Connect

<span class="ok">\u2501\u2501\u2501 Build completed successfully in 2m 41s \u2501\u2501\u2501</span>`;
  const STATIC_ANDROID = `
<span class="dim">$ </span><span class="cmd">capgo build request</span> <span class="flag">--platform</span> <span class="val">android</span>
<span class="ok">\u2714</span> Platform: <span class="val">Android</span>  \xB7  App: <span class="val">com.acme.app</span>
<span class="lock">\u{1F512}</span> <span class="ghost">Keystore and service account never stored on Capgo servers. Used only during build, then deleted.</span>

<span class="ok">\u2714</span> Build job created  \xB7  job_id <span class="kw">b8e2d1</span>
<span class="ok">\u2714</span> Project zipped  \xB7  <span class="kw">9.7 MB</span>
<span class="ok">\u2714</span> Upload complete  \xB7  <span class="val">100%</span>

<span class="dim">[gradle]</span> :app:compileReleaseKotlin
<span class="dim">[gradle]</span> :app:processReleaseResources
<span class="dim">[gradle]</span> :app:bundleReleaseJsAndAssets
<span class="dim">[gradle]</span> :app:packageRelease
<span class="dim">[gradle]</span> :app:signReleaseBundle
<span class="dim">[gradle]</span> Producing app-release.aab
<span class="ok">\u2714</span> Bundle signed  \xB7  <span class="kw">app-release.aab</span>
<span class="ok">\u2714</span> Uploaded to Play Console (Internal track)

<span class="ok">\u2501\u2501\u2501 Build completed successfully in 2m 18s \u2501\u2501\u2501</span>`;
  function staticFallback() {
    el.innerHTML = platform === "android" ? STATIC_ANDROID : STATIC_IOS;
  }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    staticFallback();
    bindTabs(staticFallback);
    return;
  }
  function makeScriptIOS() {
    return [
      {
        t: 0,
        html: `<span class="pain-prompt">$ </span><span class="cmd">capgo build request</span> <span class="flag">--platform</span> <span class="val">ios</span><span class="terminal-cursor"></span>`
      },
      {
        t: 700,
        html: `<span class="pain-prompt">$ </span><span class="cmd">capgo build request</span> <span class="flag">--platform</span> <span class="val">ios</span>
<span class="ok">\u2714</span> Platform: <span class="val">iOS</span>`,
        replaceAll: true
      },
      { t: 250, html: `
<span class="ok">\u2714</span> App: <span class="val">com.acme.app</span>` },
      { t: 250, html: `
<span class="lock">\u{1F512}</span> <span class="ghost">Credentials never stored on Capgo servers. Used only during build, then deleted.</span>` },
      { t: 400, html: `
` },
      { t: 200, html: `
<span class="ok">\u2714</span> Build job created  \xB7  job_id <span class="kw">9c4f7a</span>` },
      { t: 250, html: `
` },
      { kind: "spin", label: "Zipping project", ms: 1100, done: `<span class="ok">\u2714</span> Project zipped  \xB7  <span class="kw">12.4 MB</span>` },
      { kind: "progress", label: "Uploading", size: "12.4 MB" },
      { t: 200, html: `
` },
      { t: 200, html: `
<span class="dim">[CapApp]</span> Compiling AppDelegate.swift` },
      { t: 220, html: `
<span class="dim">[CapApp]</span> Compiling ContentView.swift` },
      { t: 220, html: `
<span class="dim">[CapApp]</span> Compiling NotificationService.swift  <span class="ghost">(extension)</span>` },
      { t: 240, html: `
<span class="dim">[CapApp]</span> Compiling WidgetKitBundle.swift  <span class="ghost">(extension)</span>` },
      { t: 280, html: `
<span class="dim">[CapApp]</span> Linking App.framework` },
      { t: 240, html: `
<span class="dim">[CapApp]</span> Signing main + 2 extensions` },
      { t: 260, html: `
<span class="dim">[CapApp]</span> Creating App.xcarchive` },
      { t: 320, html: `
<span class="ok">\u2714</span> Archive Succeeded` },
      { t: 380, html: `
<span class="ok">\u2714</span> Successfully uploaded to App Store Connect` },
      { t: 320, html: `
` },
      { t: 250, html: `
<span class="ok">\u2501\u2501\u2501 Build completed successfully in 2m 41s \u2501\u2501\u2501</span>` }
    ];
  }
  function makeScriptAndroid() {
    return [
      {
        t: 0,
        html: `<span class="pain-prompt">$ </span><span class="cmd">capgo build request</span> <span class="flag">--platform</span> <span class="val">android</span><span class="terminal-cursor"></span>`
      },
      {
        t: 700,
        html: `<span class="pain-prompt">$ </span><span class="cmd">capgo build request</span> <span class="flag">--platform</span> <span class="val">android</span>
<span class="ok">\u2714</span> Platform: <span class="val">Android</span>`,
        replaceAll: true
      },
      { t: 250, html: `
<span class="ok">\u2714</span> App: <span class="val">com.acme.app</span>` },
      {
        t: 250,
        html: `
<span class="lock">\u{1F512}</span> <span class="ghost">Keystore and service account never stored on Capgo servers. Used only during build, then deleted.</span>`
      },
      { t: 400, html: `
` },
      { t: 200, html: `
<span class="ok">\u2714</span> Build job created  \xB7  job_id <span class="kw">b8e2d1</span>` },
      { t: 250, html: `
` },
      { kind: "spin", label: "Zipping project", ms: 1100, done: `<span class="ok">\u2714</span> Project zipped  \xB7  <span class="kw">9.7 MB</span>` },
      { kind: "progress", label: "Uploading", size: "9.7 MB" },
      { t: 200, html: `
` },
      { t: 220, html: `
<span class="dim">[gradle]</span> :app:compileReleaseKotlin` },
      { t: 220, html: `
<span class="dim">[gradle]</span> :app:compileReleaseJavaWithJavac` },
      { t: 220, html: `
<span class="dim">[gradle]</span> :app:processReleaseResources` },
      { t: 240, html: `
<span class="dim">[gradle]</span> :app:bundleReleaseJsAndAssets` },
      { t: 240, html: `
<span class="dim">[gradle]</span> :app:packageRelease` },
      { t: 240, html: `
<span class="dim">[gradle]</span> :app:signReleaseBundle  <span class="ghost">(keystore)</span>` },
      { t: 240, html: `
<span class="dim">[gradle]</span> Producing <span class="val">app-release.aab</span>` },
      { t: 320, html: `
<span class="ok">\u2714</span> Bundle signed  \xB7  <span class="kw">app-release.aab</span>` },
      { t: 380, html: `
<span class="ok">\u2714</span> Uploaded to Play Console (Internal track)` },
      { t: 320, html: `
` },
      { t: 250, html: `
<span class="ok">\u2501\u2501\u2501 Build completed successfully in 2m 18s \u2501\u2501\u2501</span>` }
    ];
  }
  function makeScript() {
    return platform === "android" ? makeScriptAndroid() : makeScriptIOS();
  }
  let buf = "";
  let timer = null;
  let stepIdx = 0;
  let script = makeScript();
  function render() {
    el.innerHTML = buf;
    el.scrollTop = el.scrollHeight;
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
    if (s.kind === "progress") {
      runSpinner(s.label || "Uploading", s.size || "12.4 MB", () => {
        if (myGen === gen) next();
      });
      return;
    }
    if (s.kind === "spin") {
      runSpin(s.label || "Working", s.done || "", s.ms || 1e3, () => {
        if (myGen === gen) next();
      });
      return;
    }
    if (s.kind === "restart") {
      timer = setTimeout(() => {
        if (myGen !== gen) return;
        buf = "";
        stepIdx = 0;
        script = makeScript();
        render();
        next();
      }, 0);
      return;
    }
    timer = setTimeout(() => {
      if (myGen !== gen) return;
      if (s.replaceAll) {
        buf = s.html;
      } else {
        buf += s.html ?? "";
      }
      render();
      next();
    }, s.t || 100);
  }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) paused = true;
    else {
      const r = el.getBoundingClientRect();
      const onScreen = r.bottom > 0 && r.top < (window.innerHeight || 0);
      if (onScreen) paused = false;
    }
  });
  const replay = document.getElementById("demo-replay");
  if (replay) replay.addEventListener("click", restart);
  function bindTabs(onSwitch) {
    const tabIos = document.getElementById("demo-tab-ios");
    const tabAnd = document.getElementById("demo-tab-android");
    const title = document.getElementById("demo-term-title");
    function setPlatform(p) {
      if (p === platform) return;
      platform = p;
      if (tabIos) tabIos.classList.toggle("active", p === "ios");
      if (tabAnd) tabAnd.classList.toggle("active", p === "android");
      if (title) title.textContent = `capgo build request --platform ${p}`;
      if (onSwitch) onSwitch();
    }
    if (tabIos) tabIos.addEventListener("click", () => setPlatform("ios"));
    if (tabAnd) tabAnd.addEventListener("click", () => setPlatform("android"));
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
(function bento() {
  document.querySelectorAll(".tile[data-expandable]").forEach((tile) => {
    tile.addEventListener("click", () => tile.classList.toggle("open"));
    tile.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        tile.classList.toggle("open");
      }
    });
    tile.tabIndex = 0;
  });
})();
(function wizard() {
  const wizardEl = document.getElementById("wizard");
  const stage = document.getElementById("wizard-stage");
  const toggle = document.querySelector(".onboarding-platform-toggle");
  const platformLabel = document.getElementById("ocm-platform");
  const baBefore = document.getElementById("ba-before");
  const baAfter = document.getElementById("ba-after");
  if (!wizardEl || !stage) return;
  const PLATFORMS = {
    ios: {
      before: "Before: 10+ Apple Developer Portal steps \xB7 CSRs \xB7 profiles",
      after: "After: drop one .p8",
      content: [
        {
          title: "App Store Connect API Key",
          kind: "asc",
          lines: [
            '<span class="dim">$ </span><span class="cmd">bunx @capgo/cli@latest build init</span> <span class="flag">--platform</span> <span class="val">ios</span>',
            "",
            '<span class="ok">\u25C7</span> Project detected \xB7 <span class="kw">com.acme.app</span>',
            "",
            '<span class="cmd">?</span> How do you want to set up iOS credentials?',
            '<span class="ok">\u276F</span> \u{1F195} Create new via App Store Connect API',
            '<span class="ghost dim">  \u{1F4E5} Import existing from this Mac (Keychain + Xcode profiles)</span>',
            "",
            '<span class="cmd">?</span> Do you already have an App Store Connect API key (.p8)?',
            '<span class="ok">\u276F</span> \u2728 No, create one for me <span class="ghost">(guided, opens a window)</span>',
            '<span class="ghost dim">  \u2713  Yes, I have a .p8 file</span>',
            "",
            '<span class="dim">\u2192 </span>Opening guided App Store Connect setup\u2026'
          ]
        },
        {
          title: "Distribution Certificate",
          lines: [
            '<span class="ok">\u2714</span> API key created and verified with Apple. Key ID <span class="val">2X9F4ABC3D</span>',
            '<span class="ok">\u2713</span> <span class="kw">"Acme" (com.acme.app)</span> matches your App Store app.',
            '<span class="ok">\u2714</span> Distribution certificate created. Expires <span class="val">Jun 2027</span>'
          ]
        },
        {
          title: "Provisioning Profile",
          lines: ['<span class="ok">\u2714</span> Provisioning profile created. <span class="kw">"Capgo com.acme.app AppStore"</span>']
        },
        {
          title: "Save & Build",
          lines: [
            '<span class="ok">\u2714</span> Credentials saved',
            "",
            '<span class="cmd">?</span> Start your first cloud build now?  <span class="ok">\u276F</span> \u{1F680} Yes, build now',
            '<span class="dim">\u2192 </span>Requesting build for <span class="kw">com.acme.app</span> (ios)\u2026',
            '<span class="ok">\u2714</span> Build complete in <span class="val">2m 41s</span>',
            '<span class="ok">\u2714</span> Uploaded to App Store Connect \u{1F389}  <span class="kw">You\u2019re all set!</span>'
          ]
        }
      ]
    },
    android: {
      before: "Before: Play Console \xB7 service accounts \xB7 keystores \xB7 gradle wrangling",
      after: "After: one Google sign-in",
      content: [
        {
          title: "Sign in with Google",
          kind: "goog",
          lines: [
            '<span class="dim">$ </span><span class="cmd">bunx @capgo/cli@latest build init</span> <span class="flag">--platform</span> <span class="val">android</span>',
            "",
            '<span class="ok">\u25C7</span> Project detected \xB7 <span class="kw">com.acme.app</span>',
            "",
            '<span class="cmd">?</span> Set up Android signing?',
            '<span class="ok">\u276F</span> \u{1F195} Generate a new keystore <span class="ghost">(recommended)</span>',
            '<span class="ghost dim">  \u{1F4E5} Import an existing keystore</span>',
            '<span class="ok">\u2714</span> Keystore generated \xB7 <span class="kw">acme-release</span> <span class="ghost">(RSA-2048, node-forge, no JDK)</span>',
            "",
            '<span class="cmd">?</span> Connect Google Play for uploads?',
            '<span class="ok">\u276F</span> \u{1F310} Sign in with Google <span class="ghost">(opens a window)</span>',
            '<span class="ghost dim">  \u23ED  Skip for now</span>',
            "",
            '<span class="dim">\u2192 </span>Opening Google sign-in\u2026'
          ]
        },
        {
          title: "Play Console linked",
          lines: [
            '<span class="ok">\u2714</span> Play Developer ID <span class="kw">5734907884198356768</span> <span class="ghost">(parsed from link)</span>',
            '<span class="ok">\u2714</span> Play Console account linked. <span class="kw">Acme Inc</span>'
          ]
        },
        {
          title: "Service account",
          lines: [
            '<span class="ok">\u2714</span> GCP project selected: <span class="kw">acme-prod</span>',
            '<span class="ok">\u2714</span> Android Publisher API enabled',
            '<span class="ok">\u2714</span> Service account created. <span class="kw">capgo-builder@acme-prod.iam\u2026</span>',
            '<span class="ok">\u2714</span> Invited into Play Console as <span class="val">Release Manager</span>'
          ]
        },
        {
          title: "Save & build",
          lines: [
            '<span class="ok">\u2714</span> Credentials saved',
            "",
            '<span class="cmd">?</span> Start your first cloud build now?  <span class="ok">\u276F</span> \u{1F680} Yes, build now',
            '<span class="dim">\u2192 </span>Requesting build for <span class="kw">com.acme.app</span> (android)\u2026',
            '<span class="ok">\u2714</span> Build complete in <span class="val">3m 02s</span>',
            '<span class="ok">\u2714</span> Uploaded to Play Console (Internal track) \u{1F389}  <span class="kw">You\u2019re all set!</span>'
          ]
        }
      ]
    }
  };
  let currentPlatform = "ios";
  let idx = 0;
  let autoTimer = null;
  let ascAnim = null;
  let ascIntro = null;
  let inView = false;
  let pageVisible = typeof document !== "undefined" ? !document.hidden : true;
  let playing = false;
  let completed = false;
  const ASC_HTML = `
<div class="asc-win" data-screen="login">
  <div class="asc-titlebar"><span class="asc-traffic"><i></i><i data-target="minimize"></i><i></i></span><span class="asc-title">App Store Connect API Key</span></div>
  <div class="asc-body">
    <aside class="asc-side">
      <div class="asc-side-head"><span class="asc-keyicon">&#128273;</span><div><div class="asc-side-title">App Store Connect API Key</div><div class="asc-side-sub">Step <b class="asc-stepnum">5</b> of 10</div></div></div>
      <div class="asc-team"><span class="asc-mono-badge">A</span><div><div class="asc-team-name">Acme Inc</div><div class="asc-team-sub">Signed in &middot; Admin</div></div></div>
      <ol class="asc-steps">
        <li data-step="login" data-n="1"><span class="asc-badge"></span><span class="asc-step-t">Sign in to App Store Connect</span></li>
        <li data-step="selectTeam" data-n="2"><span class="asc-badge"></span><span class="asc-step-t">Confirm your team</span></li>
        <li data-step="verifyAccess" data-n="3"><span class="asc-badge"></span><span class="asc-step-t">Check API access</span></li>
        <li data-step="captureIssuerId" data-n="4"><span class="asc-badge"></span><span class="asc-step-t">Issuer ID captured</span></li>
        <li data-step="createKey" data-n="5"><span class="asc-badge"></span><span class="asc-step-t">Open the Generate dialog</span></li>
        <li data-step="nameKey" data-n="6"><span class="asc-badge"></span><span class="asc-step-t">Name the key</span></li>
        <li data-step="selectRole" data-n="7"><span class="asc-badge"></span><span class="asc-step-t">Set the role to Admin</span></li>
        <li data-step="generateKey" data-n="8"><span class="asc-badge"></span><span class="asc-step-t">Generate the key</span></li>
        <li data-step="captureKeyId" data-n="9"><span class="asc-badge"></span><span class="asc-step-t">Key ID captured</span></li>
        <li data-step="downloadKey" data-n="10"><span class="asc-badge"></span><span class="asc-step-t">Download the API key</span></li>
      </ol>
      <div class="asc-captured">
        <div class="asc-cap-row" data-cap="issuer"><div class="asc-cap-top"><span>Issuer ID</span><span class="asc-cap-badge">&#10003; Captured</span></div><code>69a6de1f-9a1f-&hellip;</code></div>
        <div class="asc-cap-row" data-cap="key"><div class="asc-cap-top"><span>Key ID</span><span class="asc-cap-badge">&#10003; Captured</span></div><code>2X9F4ABC3D</code></div>
      </div>
    </aside>
    <section class="asc-browser">
      <div class="asc-urlbar"><span class="asc-nav">&#8249;</span><span class="asc-nav">&#8250;</span><span class="asc-nav">&#8635;</span><span class="asc-url">appstoreconnect.apple.com/access/integrations/api</span><span class="asc-lock">&#128274;</span></div>
      <div class="asc-page">
        <div class="asc-page-h">Users and Access</div>
        <div class="asc-page-tabs"><span>People</span><span>Sandbox</span><span class="on">Integrations</span></div>
        <div class="asc-keys-bar"><div class="asc-keys-meta"><div class="asc-keys-title">App Store Connect API</div><div class="asc-issuer">Issuer ID&nbsp; <code>69a6de1f-9a1f-4cde-&hellip;</code></div></div><button class="asc-plus" data-target="plus">+</button></div>
        <div class="asc-thead"><span class="on">Active</span><span>Keys</span></div>
        <div class="asc-table">
          <div class="asc-trow asc-newkey" data-row="newkey"><span class="asc-kname">Capgo Builder</span><span class="asc-kid">2X9F4ABC3D</span><span class="asc-krole">Admin</span><a class="asc-dl" data-target="download">Download</a></div>
          <div class="asc-empty">No active keys yet</div>
        </div>
        <div class="asc-dialog">
          <div class="asc-dialog-card">
            <div class="asc-dialog-h">Generate API Key</div>
            <div class="asc-lab">Name</div>
            <div class="asc-input" data-target="name"><span class="asc-typed">Capgo Builder</span><span class="asc-caret"></span></div>
            <div class="asc-lab">Access</div>
            <div class="asc-select" data-target="role"><span class="asc-ph">Select roles&hellip;</span><span class="asc-chip">Admin <b>&times;</b></span></div>
            <div class="asc-dialog-actions"><button class="asc-btnghost">Cancel</button><button class="asc-btnprime" data-target="generate">Generate</button></div>
          </div>
        </div>
        <div class="asc-screen asc-login">
          <div class="asc-login-card">
            <div class="asc-apple"></div>
            <div class="asc-login-h">Sign in to App Store Connect</div>
            <div class="asc-login-field" data-field="email"><span class="asc-login-typed">you@acme.com</span><span class="asc-login-caret"></span></div>
            <div class="asc-login-field" data-field="pw"><span class="asc-login-typed asc-pw">&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;</span><span class="asc-login-caret"></span><button class="asc-signin" data-target="signin">&rsaquo;</button></div>
          </div>
        </div>
        <div class="asc-screen asc-team-pick">
          <div class="asc-team-card">
            <div class="asc-team-h">Choose your team</div>
            <div class="asc-team-d">A key belongs to one team &mdash; and can&rsquo;t be moved later.</div>
            <div class="asc-team-row sel"><span class="asc-mono-badge sm">A</span><div class="asc-team-meta"><b>Acme Inc</b><span>Admin</span></div><span class="asc-radio on"></span></div>
            <div class="asc-team-row"><span class="asc-mono-badge sm alt">B</span><div class="asc-team-meta"><b>Beta LLC</b><span>Developer</span></div><span class="asc-radio"></span></div>
            <button class="asc-team-go" data-target="team">Continue</button>
          </div>
        </div>
      </div>
    </section>
  </div>
  <div class="asc-cursor"></div>
  <div class="asc-callout"></div>
  <div class="asc-success"><span class="asc-success-check">&#10003;</span><div class="asc-success-t"><b>Key captured</b><span>Returning to your terminal&hellip;</span></div></div>
</div>`;
  const GOOG_HTML = `
<div class="asc-win goog" data-screen="signin">
  <div class="asc-titlebar"><span class="asc-traffic"><i></i><i data-target="minimize"></i><i></i></span><span class="goog-tabstrip"><span class="goog-tab" data-tab="auth"><span class="goog-tab-fav"></span><span class="goog-tab-t">Sign in &ndash; Google Accounts</span></span><span class="goog-tab goog-tab2" data-tab="console"><span class="goog-tab-fav play"></span><span class="goog-tab-t">Play Console</span></span></span></div>
  <div class="asc-body">
    <section class="asc-browser">
      <div class="asc-urlbar"><span class="asc-nav">&#8249;</span><span class="asc-nav">&#8250;</span><span class="asc-nav">&#8635;</span><span class="asc-url" data-target="copyUrl">accounts.google.com/o/oauth2/v2/auth</span><span class="goog-url-copied">&#10003; Copied</span><span class="asc-lock">&#128274;</span></div>
      <div class="asc-page goog-page">
        <div class="asc-screen goog-signin">
          <div class="goog-card">
            <div class="goog-logo"></div>
            <div class="goog-h">Sign in</div>
            <div class="goog-sub">Use your Google Account to continue to <b>Capgo&nbsp;Builder</b></div>
            <div class="goog-field" data-field="email"><span class="goog-typed">you@acme.com</span><span class="goog-caret"></span></div>
            <div class="goog-createacct">Create account</div>
            <div class="goog-row"><span class="goog-link">Forgot email?</span><button class="goog-next" data-target="emailNext">Next</button></div>
          </div>
        </div>
        <div class="asc-screen goog-verify">
          <div class="goog-card">
            <div class="goog-logo"></div>
            <div class="goog-h">Welcome</div>
            <div class="goog-acct-pill"><span class="goog-ava sm">M</span> you@acme.com <span class="goog-pill-x">&#9662;</span></div>
            <div class="goog-field" data-field="pw"><span class="goog-typed goog-pw">&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;</span><span class="goog-caret"></span></div>
            <div class="goog-show"><span class="goog-check"></span> Show password</div>
            <div class="goog-row"><span class="goog-link">Forgot password?</span><button class="goog-next" data-target="pwNext">Next</button></div>
          </div>
        </div>
        <div class="asc-screen goog-consent">
          <div class="goog-card wide">
            <div class="goog-consent-top"><span class="goog-appicon"></span><div class="goog-h sm">Capgo Builder wants to access your Google&nbsp;Account</div></div>
            <div class="goog-acct-pill center"><span class="goog-ava sm">M</span> you@acme.com</div>
            <div class="goog-consent-lab">This will allow Capgo Builder to:</div>
            <ul class="goog-scopes">
              <li><span class="goog-sc-ic"></span><span>View and manage your Google Play Developer account</span></li>
              <li><span class="goog-sc-ic"></span><span>Upload and manage app bundles, releases &amp; tracks</span></li>
            </ul>
            <div class="goog-consent-note">Make sure you trust Capgo Builder. You can remove access in your Google Account.</div>
            <div class="goog-consent-actions"><button class="goog-btnghost">Cancel</button><button class="goog-allow" data-target="allow">Allow</button></div>
          </div>
        </div>
        <div class="asc-screen goog-done">
          <div class="goog-done-card">
            <div class="goog-done-check">&#10003;</div>
            <div class="goog-done-h">Authentication complete</div>
            <div class="goog-done-p">Capgo CLI received your Google authorization. You can return to your terminal.</div>
            <div class="goog-done-host"><span class="asc-lock">&#128274;</span> localhost:13415 &middot; Capgo CLI</div>
          </div>
        </div>
        <div class="asc-screen goog-console">
          <div class="goog-pc-card">
            <div class="goog-pc-brand"><span class="goog-pc-mark"></span><span class="goog-pc-wm">Google Play <span class="goog-pc-wm-c">Console</span></span></div>
            <div class="goog-acct-pill center"><span class="goog-ava sm">M</span> you@acme.com <span class="goog-pill-x">&#9662;</span></div>
            <div class="goog-pc-h2">Choose developer account</div>
            <div class="goog-pc-list">
              <div class="goog-pc-acct" data-target="teamAcme"><span class="goog-team-ic">A</span><span class="goog-pc-name">Acme Inc</span></div>
              <div class="goog-pc-acct" data-target="teamBeta"><span class="goog-team-ic beta">B</span><span class="goog-pc-name">Beta LLC</span></div>
              <div class="goog-pc-acct create"><span class="goog-pc-plus">&#43;</span><span class="goog-pc-name">Create a new developer account</span></div>
            </div>
          </div>
          <div class="goog-dash">
            <aside class="goog-dash-nav">
              <div class="goog-dash-wm"><span class="goog-pc-mark"></span><span class="goog-pc-wm">Play <span class="goog-pc-wm-c">Console</span></span></div>
              <div class="goog-dn on">Home</div>
              <div class="goog-dn">Policy status</div>
              <div class="goog-dn">Users and permissions</div>
              <div class="goog-dn">Developer account</div>
              <div class="goog-dn">Settings</div>
            </aside>
            <div class="goog-dash-main">
              <div class="goog-dash-acct">
                <span class="goog-team-ic big">A</span>
                <div><div class="goog-dash-name">Acme Inc</div><div class="goog-dash-sub">Organization account &middot; Account ID <b>5734907884198356768</b></div></div>
              </div>
              <div class="goog-dash-cue">&uarr; Copy the developer link from the address bar</div>
              <div class="goog-dash-apps-h">3 apps</div>
              <div class="goog-dash-app"><span class="goog-dash-appic"></span><span class="goog-dash-appn">Acme Mobile</span><span class="goog-dash-appst">Production</span></div>
              <div class="goog-dash-app"><span class="goog-dash-appic alt"></span><span class="goog-dash-appn">Acme Lite</span><span class="goog-dash-appst">Internal testing</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
  <div class="asc-cursor"></div>
  <div class="asc-callout"></div>
</div>`;
  const DOCK_HTML = `<div class="term-dock"><span class="dock-ico finder"></span><span class="dock-ico launchpad"></span><span class="dock-ico term active"></span><span class="dock-ico folder"></span></div>`;
  const GUIDED = {
    asc: { html: ASC_HTML, intro: runAscIntro, anim: startAscAnim },
    goog: { html: GOOG_HTML, intro: runGoogIntro, anim: startGoogAnim }
  };
  const guidedFor = (c) => c && c.kind ? GUIDED[c.kind] : void 0;
  const cmdLine = () => `<span class="row"><span class="dim">$</span> <span class="cmd">capgo build init</span> <span class="flag">--platform</span> <span class="val">${currentPlatform}</span></span>`;
  function terminalLog(uptoI) {
    const startK = guidedFor(PLATFORMS[currentPlatform].content[0]) ? 1 : 0;
    let rows = startK === 1 ? cmdLine() : "";
    for (let k = startK; k <= uptoI; k++) {
      const c = PLATFORMS[currentPlatform].content[k];
      if (c) rows += c.lines.map((l) => `<span class="row">${l}</span>`).join("");
    }
    return rows;
  }
  function termWin(bodyHtml, cls = "") {
    return `<div class="term-win${cls}"><div class="term-bar"><span class="term-lights"><i></i><i></i><i></i></span><span class="term-title">zsh \u2014 capgo \xB7 ~/my-app</span></div><div class="term-body">${bodyHtml}</div></div>`;
  }
  function startAscAnim(stageEl, onComplete) {
    const root = stageEl;
    const q = (s) => root.querySelector(s);
    const win = q(".asc-win");
    const cursor = q(".asc-cursor");
    const stepNum = q(".asc-stepnum");
    const cl = q(".asc-callout");
    const LABELS = {
      signin: "Click to sign in",
      team: "Pick your team",
      plus: "Add a key",
      name: "Name the key",
      role: "Choose Admin",
      generate: "Generate",
      download: "Download key"
    };
    if (!win || !cursor) return { stop() {
    } };
    const timers = [];
    let stopped = false;
    const at = (ms, fn) => {
      timers.push(
        setTimeout(() => {
          if (!stopped) fn();
        }, ms)
      );
    };
    const ORDER = ["login", "selectTeam", "verifyAccess", "captureIssuerId", "createKey", "nameKey", "selectRole", "generateKey", "captureKeyId", "downloadKey"];
    const URLS = { login: "account.apple.com/sign-in", team: "appstoreconnect.apple.com", keys: "appstoreconnect.apple.com/access/integrations/api" };
    const urlEl = q(".asc-url");
    function setScreen(name) {
      win.dataset.screen = name;
      if (urlEl) urlEl.textContent = URLS[name] ?? urlEl.textContent;
    }
    function mark(name, state) {
      const el = root.querySelector(`[data-step="${name}"]`);
      if (!el) return;
      el.classList.remove("done", "current", "upcoming");
      el.classList.add(state);
      if (state === "current") {
        const list = root.querySelector(".asc-steps");
        if (list) {
          const lr = list.getBoundingClientRect();
          const er = el.getBoundingClientRect();
          list.scrollTop += er.top - lr.top - (lr.height - er.height) / 2;
        }
        if (stepNum) stepNum.textContent = String(ORDER.indexOf(name) + 1);
      }
    }
    function moveTo(sel) {
      const t = root.querySelector(sel);
      if (!t || !win) return;
      root.querySelectorAll(".hot").forEach((e) => e.classList.remove("hot"));
      t.classList.add("hot");
      const tr = t.getBoundingClientRect();
      const pr = win.getBoundingClientRect();
      const isField = !!t.dataset.field;
      const targetX = tr.left - pr.left + tr.width / 2;
      const cursorX = tr.left - pr.left + (isField ? Math.min(46, tr.width * 0.3) : tr.width / 2);
      const cy = tr.top - pr.top + tr.height / 2;
      cursor.style.left = cursorX + "px";
      cursor.style.top = cy + "px";
      const label = t.dataset.target ? LABELS[t.dataset.target] : "";
      if (cl && label) {
        cl.textContent = label;
        cl.classList.add("show");
        const half = cl.offsetWidth / 2;
        const clampedX = Math.max(half + 6, Math.min(targetX, pr.width - half - 6));
        cl.style.setProperty("--arrow-x", targetX - clampedX + "px");
        cl.style.left = clampedX + "px";
        cl.style.top = tr.top - pr.top + "px";
      } else {
        cl?.classList.remove("show");
      }
    }
    function press(sel) {
      const t = root.querySelector(sel);
      if (t) {
        t.classList.add("press");
        setTimeout(() => t.classList.remove("press"), 240);
      }
      cl?.classList.remove("show");
      cursor.classList.remove("click");
      void cursor.offsetWidth;
      cursor.classList.add("click");
    }
    function base() {
      win.classList.remove("dialog");
      win.classList.remove("minimizing");
      q(".asc-input")?.classList.remove("filled");
      q(".asc-select")?.classList.remove("picked");
      q('[data-row="newkey"]')?.classList.remove("show");
      q('[data-cap="issuer"]')?.classList.remove("show");
      q('[data-cap="key"]')?.classList.remove("show");
      q(".asc-success")?.classList.remove("show");
      root.querySelectorAll(".hot").forEach((e) => e.classList.remove("hot"));
      cl?.classList.remove("show");
      root.querySelectorAll(".asc-login-field").forEach((f) => f.classList.remove("typing", "done"));
      ORDER.forEach((n) => mark(n, "upcoming"));
      setScreen("login");
      if (stepNum) stepNum.textContent = "1";
      const pr = win.getBoundingClientRect();
      cursor.style.left = pr.width * 0.55 + "px";
      cursor.style.top = pr.height * 0.55 + "px";
    }
    const reduce = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      ORDER.forEach((n) => mark(n, "done"));
      setScreen("keys");
      q('[data-row="newkey"]')?.classList.add("show");
      q('[data-cap="issuer"]')?.classList.add("show");
      q('[data-cap="key"]')?.classList.add("show");
      q(".asc-success")?.classList.add("show");
      cursor.style.display = "none";
      if (stepNum) stepNum.textContent = "10";
      at(900, () => {
        if (onComplete) onComplete();
      });
      return {
        stop() {
          stopped = true;
          timers.forEach(clearTimeout);
        }
      };
    }
    function typeStart(field) {
      q(`[data-field="${field}"]`)?.classList.add("typing");
    }
    function typeDone(field) {
      const f = q(`[data-field="${field}"]`);
      f?.classList.remove("typing");
      f?.classList.add("done");
    }
    function run() {
      if (stopped) return;
      base();
      at(450, () => {
        mark("login", "current");
        moveTo('[data-field="email"]');
      });
      at(1250, () => {
        typeStart("email");
      });
      at(2050, () => {
        typeDone("email");
        moveTo('[data-field="pw"]');
      });
      at(2850, () => {
        typeStart("pw");
      });
      at(3650, () => {
        typeDone("pw");
        moveTo('[data-target="signin"]');
      });
      at(4450, () => {
        press('[data-target="signin"]');
        mark("login", "done");
        mark("selectTeam", "current");
        setScreen("team");
        moveTo('[data-target="team"]');
      });
      at(5650, () => {
        press('[data-target="team"]');
        mark("selectTeam", "done");
        mark("verifyAccess", "done");
        mark("captureIssuerId", "current");
        setScreen("keys");
      });
      at(6450, () => {
        q('[data-cap="issuer"]')?.classList.add("show");
        mark("captureIssuerId", "done");
        mark("createKey", "current");
        moveTo('[data-target="plus"]');
      });
      at(7550, () => {
        press('[data-target="plus"]');
        win.classList.add("dialog");
        mark("createKey", "done");
        mark("nameKey", "current");
        moveTo('[data-target="name"]');
      });
      at(8450, () => {
        q(".asc-input")?.classList.add("filled");
      });
      at(9250, () => {
        mark("nameKey", "done");
        mark("selectRole", "current");
        moveTo('[data-target="role"]');
      });
      at(10150, () => {
        q(".asc-select")?.classList.add("picked");
      });
      at(10650, () => {
        mark("selectRole", "done");
        mark("generateKey", "current");
        moveTo('[data-target="generate"]');
      });
      at(11650, () => {
        press('[data-target="generate"]');
        win.classList.remove("dialog");
        mark("generateKey", "done");
        mark("captureKeyId", "current");
      });
      at(12350, () => {
        q('[data-row="newkey"]')?.classList.add("show");
        q('[data-cap="key"]')?.classList.add("show");
        mark("captureKeyId", "done");
        mark("downloadKey", "current");
      });
      at(13200, () => {
        moveTo('[data-target="download"]');
      });
      at(14e3, () => {
        press('[data-target="download"]');
      });
      at(14400, () => {
        mark("downloadKey", "done");
      });
      at(15200, () => {
        q(".asc-success")?.classList.add("show");
      });
      at(17150, () => {
        q(".asc-success")?.classList.remove("show");
        moveTo('[data-target="minimize"]');
      });
      at(18050, () => {
        press('[data-target="minimize"]');
        win.classList.add("minimizing");
      });
      at(19200, () => {
        if (onComplete) onComplete();
      });
    }
    run();
    return {
      stop() {
        stopped = true;
        timers.forEach(clearTimeout);
      }
    };
  }
  function startGoogAnim(stageEl, onComplete) {
    const root = stageEl;
    const q = (s) => root.querySelector(s);
    const win = q(".asc-win");
    const cursor = q(".asc-cursor");
    const cl = q(".asc-callout");
    const LABELS = {
      emailNext: "Next",
      pwNext: "Next",
      allow: "Allow access"
    };
    if (!win || !cursor) return { stop() {
    } };
    const timers = [];
    let stopped = false;
    const at = (ms, fn) => {
      timers.push(
        setTimeout(() => {
          if (!stopped) fn();
        }, ms)
      );
    };
    const URLS = {
      signin: "accounts.google.com/o/oauth2/v2/auth",
      verify: "accounts.google.com/signin/challenge/pwd",
      consent: "accounts.google.com/o/oauth2/v2/auth?prompt=consent",
      done: "localhost:13415/callback?code=4/0Ad\u2026",
      console: "play.google.com/console/u/0/developers"
    };
    const urlEl = q(".asc-url");
    function setScreen(name) {
      win.dataset.screen = name;
      if (urlEl) urlEl.textContent = URLS[name] ?? urlEl.textContent;
    }
    function moveTo(sel) {
      const t = root.querySelector(sel);
      if (!t || !win) return;
      root.querySelectorAll(".hot").forEach((e) => e.classList.remove("hot"));
      t.classList.add("hot");
      const tr = t.getBoundingClientRect();
      const pr = win.getBoundingClientRect();
      const isField = !!t.dataset.field;
      const targetX = tr.left - pr.left + tr.width / 2;
      const cursorX = tr.left - pr.left + (isField ? Math.min(46, tr.width * 0.3) : tr.width / 2);
      const cy = tr.top - pr.top + tr.height / 2;
      cursor.style.left = cursorX + "px";
      cursor.style.top = cy + "px";
      const label = t.dataset.target ? LABELS[t.dataset.target] : "";
      if (cl && label) {
        cl.textContent = label;
        cl.classList.add("show");
        const half = cl.offsetWidth / 2;
        const clampedX = Math.max(half + 6, Math.min(targetX, pr.width - half - 6));
        cl.style.setProperty("--arrow-x", targetX - clampedX + "px");
        cl.style.left = clampedX + "px";
        cl.style.top = tr.top - pr.top + "px";
      } else {
        cl?.classList.remove("show");
      }
    }
    function press(sel) {
      const t = root.querySelector(sel);
      if (t) {
        t.classList.add("press");
        setTimeout(() => t.classList.remove("press"), 240);
      }
      cl?.classList.remove("show");
      cursor.classList.remove("click");
      void cursor.offsetWidth;
      cursor.classList.add("click");
    }
    function termAppend(html) {
      const b = root.querySelector(".term-body");
      if (b) {
        b.insertAdjacentHTML("beforeend", html);
        b.scrollTop = b.scrollHeight;
      }
    }
    function base() {
      win.classList.remove("goog-min", "tab2", "url-copied");
      root.querySelectorAll(".hot").forEach((e) => e.classList.remove("hot"));
      cl?.classList.remove("show");
      root.querySelectorAll(".goog-field").forEach((f) => f.classList.remove("typing", "done"));
      root.querySelectorAll(".goog-team-row, .goog-pc-acct").forEach((r) => r.classList.remove("sel"));
      urlEl?.classList.remove("sel");
      q(".goog-console")?.classList.remove("picked");
      setScreen("signin");
      const pr = win.getBoundingClientRect();
      cursor.style.left = pr.width * 0.55 + "px";
      cursor.style.top = pr.height * 0.55 + "px";
    }
    const reduce = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      win.classList.add("tab2", "url-copied");
      setScreen("console");
      if (urlEl) urlEl.textContent = "play.google.com/console/u/0/developers/5734907884198356768/app-list";
      urlEl?.classList.add("sel");
      root.querySelector('[data-target="teamAcme"]')?.classList.add("sel");
      q(".goog-console")?.classList.add("picked");
      cursor.style.display = "none";
      at(900, () => {
        if (onComplete) onComplete();
      });
      return {
        stop() {
          stopped = true;
          timers.forEach(clearTimeout);
        }
      };
    }
    function typeStart(field) {
      q(`[data-field="${field}"]`)?.classList.add("typing");
    }
    function typeDone(field) {
      const f = q(`[data-field="${field}"]`);
      f?.classList.remove("typing");
      f?.classList.add("done");
    }
    function run() {
      if (stopped) return;
      base();
      const SEL = {
        q: "Copy your Play Console developer link",
        opts: ["\u{1F3AC} Watch the 60s tutorial", "\u{1F310} Open Play Console in your browser", "\u23CE Continue. I already have it"],
        pick: 1
      };
      const PASTE_Q = "Paste your Play Console developer account link";
      const PASTE_LINK = "play.google.com/console/u/0/developers/5734907884198356768/app-list";
      const PASTE_WAIT = `<span class="row"><span class="kw">\u25C6</span> ${PASTE_Q}</span><span class="row dim"><span class="ghost">\u2502</span>  <span class="goog-tcaret"></span></span>`;
      const PASTE_FILLED = `<span class="row"><span class="ok">\u25C7</span> ${PASTE_Q}</span><span class="row dim"><span class="ghost">\u2502</span>  <span class="kw">${PASTE_LINK}</span></span>`;
      let beatLog = "";
      const renderTerm = (html) => {
        const b = root.querySelector(".term-body");
        if (b) {
          b.innerHTML = beatLog + html;
          b.scrollTop = b.scrollHeight;
        }
      };
      at(450, () => {
        moveTo('[data-field="email"]');
      });
      at(1250, () => {
        typeStart("email");
      });
      at(2150, () => {
        typeDone("email");
        moveTo('[data-target="emailNext"]');
      });
      at(2900, () => {
        press('[data-target="emailNext"]');
        setScreen("verify");
        moveTo('[data-field="pw"]');
      });
      at(3800, () => {
        typeStart("pw");
      });
      at(4700, () => {
        typeDone("pw");
        moveTo('[data-target="pwNext"]');
      });
      at(5450, () => {
        press('[data-target="pwNext"]');
        setScreen("consent");
      });
      at(6450, () => {
        moveTo('[data-target="allow"]');
      });
      at(7350, () => {
        press('[data-target="allow"]');
        setScreen("done");
      });
      at(8200, () => {
        moveTo('[data-target="minimize"]');
      });
      at(9150, () => {
        press('[data-target="minimize"]');
        win.classList.add("goog-min");
      });
      at(10200, () => {
        termAppend('<span class="row"><span class="ok">\u2714</span> Google sign-in complete \xB7 <span class="val">you@acme.com</span></span>');
        const b = root.querySelector(".term-body");
        if (b) {
          b.classList.add("no-anim");
          beatLog = b.innerHTML;
        }
      });
      at(10650, () => renderTerm(selActive(SEL, 0)));
      at(11250, () => renderTerm(selActive(SEL, 1)));
      at(11850, () => renderTerm(selActive(SEL, 2)));
      at(12450, () => renderTerm(selActive(SEL, 1)));
      at(13050, () => {
        beatLog += selAnswered(SEL);
        renderTerm(PASTE_WAIT);
      });
      at(13400, () => {
        win.classList.add("tab2");
        setScreen("console");
      });
      at(13750, () => {
        win.classList.remove("goog-min");
      });
      at(14900, () => {
        moveTo('[data-target="teamAcme"]');
      });
      at(15800, () => {
        press('[data-target="teamAcme"]');
        root.querySelector('[data-target="teamAcme"]')?.classList.add("sel");
        q(".goog-console")?.classList.add("picked");
        if (urlEl) urlEl.textContent = PASTE_LINK;
      });
      at(17e3, () => {
        moveTo('[data-target="copyUrl"]');
      });
      at(17900, () => {
        press('[data-target="copyUrl"]');
        urlEl?.classList.add("sel");
        win.classList.add("url-copied");
      });
      at(19800, () => {
        moveTo('[data-target="minimize"]');
      });
      at(20700, () => {
        press('[data-target="minimize"]');
        win.classList.add("goog-min");
      });
      at(21700, () => {
        renderTerm(PASTE_FILLED);
      });
      at(22250, () => {
        if (onComplete) onComplete();
      });
    }
    run();
    return {
      stop() {
        stopped = true;
        timers.forEach(clearTimeout);
      }
    };
  }
  function getSteps() {
    return wizardEl.querySelectorAll(`.wizard-step[data-platform="${currentPlatform}"]`);
  }
  const selAnswered = (p) => `<span class="row"><span class="ok">\u25C7</span> ${p.q}</span><span class="row dim"><span class="ghost">\u2502</span>  ${p.opts[p.pick]}</span>`;
  const selActive = (p, sel) => `<span class="row"><span class="kw">\u25C6</span> ${p.q}</span>` + p.opts.map((o, i) => `<span class="row sel-opt${i === sel ? " on" : ""}"><span class="ghost">\u2502</span> ${i === sel ? '<span class="opt-ptr">\u276F</span>' : " "} ${o}</span>`).join("") + '<span class="row sel-hint"><span class="ghost">\u2502</span>  \u2191/\u2193 move \xB7 \u21B5 select</span>';
  function runAscIntro(body, onDone) {
    const timers = [];
    let stopped = false;
    const at = (ms, fn) => {
      timers.push(
        setTimeout(() => {
          if (!stopped) fn();
        }, ms)
      );
    };
    body.classList.add("no-anim");
    const CMD = '<span class="row"><span class="dim">$ </span><span class="cmd">bunx @capgo/cli@latest build init</span> <span class="flag">--platform</span> <span class="val">ios</span></span>';
    const DETECT = '<span class="row"><span class="ok">\u25C7</span> Project detected \xB7 <span class="kw">com.acme.app</span></span>';
    const P1 = {
      q: "How do you want to set up iOS credentials?",
      opts: ["\u{1F195} Create new via App Store Connect API", "\u{1F4E5} Import existing from this Mac (Keychain + Xcode profiles)"],
      pick: 0
    };
    const P2 = {
      q: "Do you already have an App Store Connect API key (.p8)?",
      opts: ['\u2728 No, create one for me <span class="ghost">(guided, opens a window)</span>', "\u2713  Yes, I have a .p8 file"],
      pick: 0
    };
    let log = "";
    const render = (live) => {
      body.innerHTML = log + live;
    };
    at(120, () => {
      log = CMD;
      render("");
    });
    at(640, () => {
      log = CMD + DETECT;
      render("");
    });
    at(1180, () => render(selActive(P1, 0)));
    at(1780, () => render(selActive(P1, 1)));
    at(2340, () => render(selActive(P1, 0)));
    at(2900, () => {
      log = CMD + DETECT + selAnswered(P1);
      render("");
    });
    at(3380, () => render(selActive(P2, 0)));
    at(3980, () => render(selActive(P2, 1)));
    at(4540, () => render(selActive(P2, 0)));
    at(5100, () => {
      log = CMD + DETECT + selAnswered(P1) + selAnswered(P2);
      render("");
    });
    at(5560, () => {
      log += '<span class="row"><span class="dim">\u2192 </span>Opening guided App Store Connect setup\u2026</span>';
      render("");
    });
    at(6200, () => {
      body.classList.remove("no-anim");
      onDone();
    });
    return {
      stop() {
        stopped = true;
        timers.forEach(clearTimeout);
        body.classList.remove("no-anim");
      }
    };
  }
  function runGoogIntro(body, onDone) {
    const timers = [];
    let stopped = false;
    const at = (ms, fn) => {
      timers.push(
        setTimeout(() => {
          if (!stopped) fn();
        }, ms)
      );
    };
    body.classList.add("no-anim");
    const CMD = '<span class="row"><span class="dim">$ </span><span class="cmd">bunx @capgo/cli@latest build init</span> <span class="flag">--platform</span> <span class="val">android</span></span>';
    const DETECT = '<span class="row"><span class="ok">\u25C7</span> Project detected \xB7 <span class="kw">com.acme.app</span></span>';
    const KEYGEN = '<span class="row"><span class="ok">\u2714</span> Keystore generated \xB7 <span class="kw">acme-release</span> <span class="ghost">(RSA-2048, node-forge, no JDK)</span></span>';
    const P1 = {
      q: "Set up Android signing?",
      opts: ['\u{1F195} Generate a new keystore <span class="ghost">(recommended)</span>', "\u{1F4E5} Import an existing keystore"],
      pick: 0
    };
    const P2 = { q: "Connect Google Play for uploads?", opts: ['\u{1F310} Sign in with Google <span class="ghost">(opens a window)</span>', "\u23ED  Skip for now"], pick: 0 };
    let log = "";
    const render = (live) => {
      body.innerHTML = log + live;
    };
    at(120, () => {
      log = CMD;
      render("");
    });
    at(640, () => {
      log = CMD + DETECT;
      render("");
    });
    at(1180, () => render(selActive(P1, 0)));
    at(1780, () => render(selActive(P1, 1)));
    at(2340, () => render(selActive(P1, 0)));
    at(2900, () => {
      log = CMD + DETECT + selAnswered(P1) + KEYGEN;
      render("");
    });
    at(3500, () => render(selActive(P2, 0)));
    at(4100, () => render(selActive(P2, 1)));
    at(4660, () => render(selActive(P2, 0)));
    at(5220, () => {
      log = CMD + DETECT + selAnswered(P1) + KEYGEN + selAnswered(P2);
      render("");
    });
    at(5680, () => {
      log += '<span class="row"><span class="dim">\u2192 </span>Opening Google sign-in\u2026</span>';
      render("");
    });
    at(6320, () => {
      body.classList.remove("no-anim");
      onDone();
    });
    return {
      stop() {
        stopped = true;
        timers.forEach(clearTimeout);
        body.classList.remove("no-anim");
      }
    };
  }
  function paint(i, play = false, onComplete) {
    const c = PLATFORMS[currentPlatform].content[i];
    if (!c) return;
    if (ascAnim) {
      ascAnim.stop();
      ascAnim = null;
    }
    if (ascIntro) {
      ascIntro.stop();
      ascIntro = null;
    }
    const total = PLATFORMS[currentPlatform].content.length;
    const head = `<h3>Step ${i + 1} / ${total}: ${c.title}</h3>`;
    const guided = guidedFor(c);
    if (guided) {
      stage.innerHTML = `${head}<div class="desk" aria-hidden="true">${termWin("")}${DOCK_HTML}</div>`;
      const body = stage.querySelector(".term-body");
      const openGuidedWindow = () => {
        if (body && !body.isConnected) return;
        const desk = stage.querySelector(".desk");
        const dock = stage.querySelector(".term-dock");
        if (dock) dock.insertAdjacentHTML("beforebegin", guided.html);
        else if (desk) desk.insertAdjacentHTML("beforeend", guided.html);
        stage.querySelector(".asc-win")?.classList.add("asc-opening");
        if (play) ascAnim = guided.anim(stage, onComplete);
      };
      const reduceIntro = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (play && !reduceIntro && body) {
        ascIntro = guided.intro(body, openGuidedWindow);
      } else {
        if (body) body.innerHTML = c.lines.map((l) => `<span class="row">${l}</span>`).join("");
        if (play) openGuidedWindow();
      }
    } else {
      stage.innerHTML = `${head}<div class="desk" aria-hidden="true">${termWin(terminalLog(i))}${DOCK_HTML}</div>`;
    }
    getSteps().forEach((s, j) => {
      s.classList.toggle("active", j === i);
      s.classList.toggle("done", j < i);
    });
  }
  function setPlatform(p) {
    if (!PLATFORMS[p] || p === currentPlatform) return;
    if (ascAnim) {
      ascAnim.stop();
      ascAnim = null;
    }
    if (ascIntro) {
      ascIntro.stop();
      ascIntro = null;
    }
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
    currentPlatform = p;
    wizardEl.setAttribute("data-platform", p);
    wizardEl.querySelectorAll(".wizard-step").forEach((s) => {
      s.hidden = s.getAttribute("data-platform") !== p;
    });
    if (toggle) {
      toggle.querySelectorAll(".opt").forEach((b) => {
        const active = b.getAttribute("data-platform") === p;
        b.classList.toggle("active", active);
        b.setAttribute("aria-pressed", active ? "true" : "false");
      });
    }
    if (platformLabel) platformLabel.textContent = p;
    if (baBefore) baBefore.textContent = PLATFORMS[p].before;
    if (baAfter) baAfter.textContent = PLATFORMS[p].after;
    getSteps().forEach((s, j) => {
      ;
      s.onclick = () => {
        if (autoTimer) {
          clearInterval(autoTimer);
          autoTimer = null;
        }
        idx = j;
        paint(idx, !!guidedFor(PLATFORMS[currentPlatform].content[j]));
      };
    });
    playing = false;
    completed = false;
    idx = 0;
    startAutoplay();
  }
  wizardEl.querySelectorAll(".wizard-step").forEach((s) => {
    s.hidden = s.getAttribute("data-platform") !== currentPlatform;
  });
  getSteps().forEach((s, j) => {
    s.onclick = () => {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
      idx = j;
      paint(idx, !!guidedFor(PLATFORMS[currentPlatform].content[j]));
    };
  });
  paint(0);
  if (toggle) {
    toggle.querySelectorAll(".opt").forEach((b) => {
      b.addEventListener("click", () => setPlatform(b.getAttribute("data-platform") || "ios"));
    });
  }
  function advanceTerminal(i) {
    const c = PLATFORMS[currentPlatform].content[i];
    if (!c) return;
    const total = PLATFORMS[currentPlatform].content.length;
    const h4 = stage.querySelector("h3");
    if (h4) h4.textContent = `Step ${i + 1} / ${total}: ${c.title}`;
    const body = stage.querySelector(".term-body");
    if (body) {
      const rows = c.lines.map((l, k) => `<span class="row" style="animation-delay:${(k * 0.16).toFixed(2)}s">${l}</span>`).join("");
      body.insertAdjacentHTML("beforeend", rows);
      body.scrollTop = body.scrollHeight;
    }
    getSteps().forEach((s, j) => {
      s.classList.toggle("active", j === i);
      s.classList.toggle("done", j < i);
    });
  }
  function stepThrough() {
    const len = PLATFORMS[currentPlatform].content.length;
    autoTimer = setInterval(() => {
      idx++;
      if (idx >= len) {
        if (autoTimer) clearInterval(autoTimer);
        autoTimer = null;
        idx = len - 1;
        return;
      }
      advanceTerminal(idx);
    }, 2e3);
  }
  function startAutoplay() {
    if (playing || completed || !inView || !pageVisible) return;
    idx = 0;
    if (guidedFor(PLATFORMS[currentPlatform].content[0])) {
      playing = true;
      paint(0, true, () => {
        completed = true;
        idx = 1;
        stage.querySelector(".asc-win")?.remove();
        advanceTerminal(idx);
        stepThrough();
      });
    } else {
      playing = true;
      paint(0);
      stepThrough();
    }
  }
  function stopAutoplay() {
    if (ascAnim) {
      ascAnim.stop();
      ascAnim = null;
    }
    if (ascIntro) {
      ascIntro.stop();
      ascIntro = null;
    }
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
    if (!completed) {
      playing = false;
      idx = 0;
      paint(0);
    }
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        inView = e.isIntersecting;
        if (inView) startAutoplay();
        else stopAutoplay();
      });
    },
    { threshold: 0.1 }
  );
  io.observe(stage);
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", () => {
      pageVisible = !document.hidden;
      if (pageVisible) startAutoplay();
      else stopAutoplay();
    });
  }
})();
(function buildCalc() {
  const root = document.querySelector(".build-calc");
  const range = document.getElementById("bc-range");
  const minEl = document.getElementById("bc-min");
  const iosEl = document.getElementById("bc-ios");
  const andEl = document.getElementById("bc-and");
  const priceEl = document.getElementById("bc-price");
  if (!root || !range || !minEl || !iosEl || !andEl) return;
  let tiers = [];
  try {
    tiers = JSON.parse(root.getAttribute("data-tiers") || "[]");
  } catch (_) {
  }
  function priceFor(minutes) {
    let cost = 0;
    for (const t of tiers) {
      const to = t.to && t.to > t.from ? t.to : Infinity;
      if (minutes <= t.from) break;
      cost += (Math.min(minutes, to) - t.from) * t.price;
    }
    return cost;
  }
  function update() {
    const m = parseInt(range.value, 10) || 0;
    minEl.textContent = String(m);
    iosEl.textContent = String(Math.max(0, Math.floor(m / 5)));
    andEl.textContent = String(Math.max(0, Math.floor(m / 2.5)));
    if (priceEl) priceEl.textContent = "$" + Math.round(priceFor(m));
  }
  range.addEventListener("input", update);
  update();
})();
(function aiDebugTerminal() {
  const body = document.querySelector(".aidebug-body");
  if (!body) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const rows = Array.from(body.querySelectorAll(".row"));
  if (!rows.length) return;
  const SPIN = ["\u280B", "\u2819", "\u2839", "\u2838", "\u283C", "\u2834", "\u2826", "\u2827", "\u2807", "\u280F"];
  const selected = body.querySelector("[data-menu-selected]");
  const selCheck = selected ? selected.innerHTML : "";
  const selCursor = '<span class="val">\u276F Capgo AI</span>';
  let started = false;
  let gen = 0;
  rows.forEach((r) => {
    r.style.opacity = "0";
  });
  function run() {
    gen++;
    const myGen = gen;
    rows.forEach((r) => {
      r.style.opacity = "0";
      if (r.classList.contains("menu-extra")) r.style.display = "";
    });
    let i = 0;
    function step() {
      if (myGen !== gen) return;
      if (i >= rows.length) return;
      const r = rows[i];
      if (r.classList.contains("menu-extra")) r.style.display = "block";
      if (r.hasAttribute("data-menu-selected")) r.innerHTML = selCursor;
      if (r.hasAttribute("data-ai-spin")) {
        const finalHTML = r.innerHTML;
        r.style.opacity = "1";
        let frame = 0;
        const start = Date.now();
        const spin = () => {
          if (myGen !== gen) return;
          r.innerHTML = `<span class="kw">${SPIN[frame % SPIN.length]}</span> <span class="ghost">Analyzing build log with Capgo AI\u2026</span>`;
          frame++;
          if (Date.now() - start >= 1500) {
            r.innerHTML = finalHTML;
            i++;
            setTimeout(step, 320);
          } else {
            setTimeout(spin, 90);
          }
        };
        spin();
        return;
      }
      r.style.opacity = "1";
      if (r.hasAttribute("data-collapse")) {
        i++;
        setTimeout(() => {
          if (myGen !== gen) return;
          rows.forEach((x) => {
            if (x.classList.contains("menu-extra")) {
              x.style.opacity = "0";
              x.style.display = "none";
            }
          });
          if (selected) selected.innerHTML = selCheck;
          setTimeout(step, 360);
        }, 1100);
        return;
      }
      i++;
      const delay = r.classList.contains("ai-head") ? 560 : 240;
      setTimeout(step, delay);
    }
    step();
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !started) {
          started = true;
          io.disconnect();
          run();
        }
      });
    },
    { threshold: 0.35 }
  );
  io.observe(body);
  const replay = document.getElementById("aidebug-replay");
  if (replay) replay.addEventListener("click", run);
})();
