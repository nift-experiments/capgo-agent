# Capgo Agent — Nift-native reconstruction

All 1,347 routes render from maintained HTML bodies and shared Nift includes. Normal builds do not compile MDX or require Astro. All 21 browser entry controllers build from tracked JavaScript; production styles/assets preserve the pinned Capgo design. The old prototype is retained as historical material, not the current preview.

```sh
npm ci --ignore-scripts
node tools/build.mjs --all
npm run preview
```

Install Nift on PATH (or set `NIFT` for the preparation wrapper) and Node.js 22+. Preview: http://127.0.0.1:4173/. Build threads default to `-1`, all available cores. Once prepared, use ordinary `nift build --all` and `nift build`.

`npm test` checks DOM semantics, local provider handling and browser-asset corruption rejection; build before running it. `npm run audit` checks tracked Nift inputs. `node tools/parity.mjs` checks every route/reference asset against the pinned oracle, explicitly accounting for source-verified replacement scripts and audited retired chunks.

See `docs/NATIVE-ARCHITECTURE.md`, `docs/INTERACTION-MATRIX.md`, `docs/CLEAN-CHECKOUT.md` and `HANDOVER.md`. Final architecture freeze and repeated benchmark results will be recorded separately. Earlier single-run timings are historical, not final performance claims.

Capgo styling may include blue/light themes; dark/no-blue applies only to the Labs report site. Compatible own APIs are supported through public build configuration and the optional preview adapter. Private account/device/signing workflows still require compatible services; see the architecture report for exact limits.
