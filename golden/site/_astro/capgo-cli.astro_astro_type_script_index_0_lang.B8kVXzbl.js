(function(){const d=document.getElementById("demo-term-body");if(!d)return;let r=!1,T=!1,n=0,f="release";const v=["⠋","⠙","⠹","⠸","⠼","⠴","⠦","⠧","⠇","⠏"],S={release:"npx @capgo/cli bundle releaseType",upload:"npx @capgo/cli bundle upload",build:"npx @capgo/cli build request"},I={release:`<span class="dim">$ </span><span class="cmd">npx @capgo/cli@latest bundle releaseType</span> <span class="flag">com.acme.app</span> <span class="flag">--channel</span> <span class="val">production</span>
<span class="ok">✔</span> Channel: <span class="val">production</span>  ·  App: <span class="val">com.acme.app</span>
<span class="ok">Recommendation:</span> <span class="val">OTA update</span>
<span class="ghost">No native dependency drift detected for production.</span>

<span class="ok">━━━ Safe to ship as a live update ━━━</span>`,upload:`<span class="dim">$ </span><span class="cmd">npx @capgo/cli@latest bundle upload</span> <span class="flag">--channel</span> <span class="val">production</span> <span class="flag">--fail-on-incompatible</span> <span class="flag">--qr-preview</span>
<span class="ok">✔</span> Compatibility gate passed
<span class="ok">✔</span> Bundle validated  ·  <span class="kw">2.1 MB</span>
<span class="ok">✔</span> Delta upload ready  ·  <span class="kw">340 KB</span>
<span class="ok">✔</span> Published to <span class="val">production</span>
<span class="lock">QR</span> Preview link generated for device testing

<span class="ok">━━━ Live update rolling out ━━━</span>`,build:`<span class="dim">$ </span><span class="cmd">npx @capgo/cli@latest build request</span> <span class="flag">com.acme.app</span> <span class="flag">--platform</span> <span class="val">ios</span> <span class="flag">--output-record</span> <span class="val">.capgo/build.json</span>
<span class="ok">✔</span> Platform: <span class="val">iOS</span>  ·  Mode: <span class="val">release</span>
<span class="lock">🔒</span> <span class="ghost">Credentials used only during build, then deleted.</span>

<span class="ok">✔</span> Build job created  ·  job_id <span class="kw">9c4f7a</span>
<span class="ok">✔</span> Upload complete  ·  <span class="val">100%</span>
<span class="dim">[CapApp]</span> Archive succeeded
<span class="ok">✔</span> Output record saved  ·  <span class="val">.capgo/build.json</span>

<span class="ok">━━━ Native build completed in 2m 41s ━━━</span>`};function x(){return[{t:0,html:'<span class="pain-prompt">$ </span><span class="cmd">npx @capgo/cli@latest bundle releaseType</span> <span class="flag">com.acme.app</span> <span class="flag">--channel</span> <span class="val">production</span><span class="terminal-cursor"></span>'},{t:700,html:`<span class="pain-prompt">$ </span><span class="cmd">npx @capgo/cli@latest bundle releaseType</span> <span class="flag">com.acme.app</span> <span class="flag">--channel</span> <span class="val">production</span>
<span class="ok">✔</span> Channel: <span class="val">production</span>`,replaceAll:!0},{t:250,html:`
<span class="ok">✔</span> App: <span class="val">com.acme.app</span>`},{t:350,html:`
<span class="ok">Recommendation:</span> <span class="val">OTA update</span>`},{t:300,html:`
<span class="ghost">No native dependency drift detected for production.</span>`},{t:400,html:`
`},{t:300,html:`
<span class="ok">━━━ Safe to ship as a live update ━━━</span>`}]}function C(){return[{t:0,html:'<span class="pain-prompt">$ </span><span class="cmd">npx @capgo/cli@latest bundle upload</span> <span class="flag">--channel</span> <span class="val">production</span> <span class="flag">--fail-on-incompatible</span> <span class="flag">--qr-preview</span><span class="terminal-cursor"></span>'},{t:700,html:`<span class="pain-prompt">$ </span><span class="cmd">npx @capgo/cli@latest bundle upload</span> <span class="flag">--channel</span> <span class="val">production</span> <span class="flag">--fail-on-incompatible</span> <span class="flag">--qr-preview</span>
<span class="ok">✔</span> Compatibility gate passed`,replaceAll:!0},{kind:"spin",label:"Validating bundle",ms:900,done:'<span class="ok">✔</span> Bundle validated  ·  <span class="kw">2.1 MB</span>'},{kind:"progress",label:"Uploading delta",size:"340 KB"},{t:250,html:`
<span class="ok">✔</span> Published to <span class="val">production</span>`},{t:250,html:`
<span class="lock">QR</span> Preview link generated for device testing`},{t:350,html:`
`},{t:300,html:`
<span class="ok">━━━ Live update rolling out ━━━</span>`}]}function j(){return[{t:0,html:'<span class="pain-prompt">$ </span><span class="cmd">npx @capgo/cli@latest build request</span> <span class="flag">com.acme.app</span> <span class="flag">--platform</span> <span class="val">ios</span> <span class="flag">--output-record</span> <span class="val">.capgo/build.json</span><span class="terminal-cursor"></span>'},{t:700,html:`<span class="pain-prompt">$ </span><span class="cmd">npx @capgo/cli@latest build request</span> <span class="flag">com.acme.app</span> <span class="flag">--platform</span> <span class="val">ios</span> <span class="flag">--output-record</span> <span class="val">.capgo/build.json</span>
<span class="ok">✔</span> Platform: <span class="val">iOS</span>`,replaceAll:!0},{t:250,html:`
<span class="ok">✔</span> Mode: <span class="val">release</span>`},{t:300,html:`
<span class="lock">🔒</span> <span class="ghost">Credentials used only during build, then deleted.</span>`},{t:350,html:`
`},{t:200,html:`
<span class="ok">✔</span> Build job created  ·  job_id <span class="kw">9c4f7a</span>`},{kind:"progress",label:"Uploading project",size:"12.4 MB"},{t:220,html:`
<span class="dim">[CapApp]</span> Archive succeeded`},{t:280,html:`
<span class="ok">✔</span> Output record saved  ·  <span class="val">.capgo/build.json</span>`},{t:350,html:`
`},{t:300,html:`
<span class="ok">━━━ Native build completed in 2m 41s ━━━</span>`}]}function B(){return f==="upload"?C():f==="build"?j():x()}let e="",c=null,k=0,y=B();function u(){d.innerHTML=e,d.scrollTop=d.scrollHeight}function w(){n++;const a=n;c&&clearTimeout(c),e="",k=0,y=B(),u(),setTimeout(()=>{a===n&&m()},50)}function $(){d.innerHTML=I[f]}if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){$(),E($);return}function M(a,s,o,p){let i=0,t=0;const l=e,g=n;function h(){if(g!==n)return;if(r){c=setTimeout(h,100);return}const b=v[i%v.length];e=l+`
<span class="kw">${b}</span> ${a}…`,u(),i++,t+=80,t>=o?(e=l+`
${s}`,u(),p()):c=setTimeout(h,80)}h()}function R(a,s,o){let p=0,i=0;const t=e,l=n;function g(){if(l!==n)return;if(r){c=setTimeout(g,100);return}const h=v[i%v.length],b=Math.min(100,Math.round(p)),L=Math.round(b*24/100),q="█".repeat(L)+"░".repeat(24-L);e=t+`
<span class="kw">${h}</span> ${a}  <span class="dim">[</span><span class="val">${q}</span><span class="dim">]</span>  <span class="val">${b}%</span>`,u(),i++,p+=Math.max(1.6,(100-p)*.12),p>=99.5?(e=t+`
<span class="ok">✔</span> Upload complete  ·  <span class="val">${s} / ${s}</span>`,u(),o()):c=setTimeout(g,55)}g()}function m(){const a=n;if(r){c=setTimeout(()=>{a===n&&m()},150);return}if(k>=y.length)return;const s=y[k++];if("kind"in s&&s.kind==="progress"){R(s.label||"Uploading",s.size||"12.4 MB",()=>{a===n&&m()});return}if("kind"in s&&s.kind==="spin"){M(s.label||"Working",s.done||"",s.ms||1e3,()=>{a===n&&m()});return}c=setTimeout(()=>{a===n&&("replaceAll"in s&&s.replaceAll?e=s.html:e+=s.html??"",u(),m())},s.t||100)}document.addEventListener("visibilitychange",()=>{if(document.hidden)r=!0;else{const a=d.getBoundingClientRect();a.bottom>0&&a.top<(window.innerHeight||0)&&(r=!1)}});const A=document.getElementById("demo-replay");A&&A.addEventListener("click",w);function E(a){const s=document.getElementById("demo-tab-release"),o=document.getElementById("demo-tab-upload"),p=document.getElementById("demo-tab-build"),i=document.getElementById("demo-term-title");function t(l){l!==f&&(f=l,s?.classList.toggle("active",l==="release"),o?.classList.toggle("active",l==="upload"),p?.classList.toggle("active",l==="build"),i&&(i.textContent=S[l]),a())}s?.addEventListener("click",()=>t("release")),o?.addEventListener("click",()=>t("upload")),p?.addEventListener("click",()=>t("build"))}E(w),new IntersectionObserver(a=>{a.forEach(s=>{if(s.isIntersecting){if(r=!1,!T){T=!0;const o=n;setTimeout(()=>{o===n&&m()},300)}}else r=!0})},{threshold:.25}).observe(d)})();
