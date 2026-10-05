# Capgo Agent — golden-reference migration

The current local preview renders all 1,347 routes from maintained HTML bodies and shared Nift includes. Normal builds do not compile MDX. The earlier prototype is archived in `docs/prototype` and its generated output is preserved locally under `build/archive`.

This is the Phase 8 baseline, not the finished vanilla implementation: production CSS, assets and JavaScript remain intact until their behavior is reconstructed and checked against the golden reference.

```sh
npm ci --ignore-scripts
NIFT=/path/to/nift node tools/build.mjs --all
node runtime/server.mjs
node tools/parity.mjs
```

Build threads default to `-1` (all available cores). Set `NIFT_BUILD_THREADS` to override. Preview: http://127.0.0.1:4173/. All HTML routes retain byte parity; permitted native-controller asset replacements are checked against their maintained source.

The measured first build of this baseline took **3.66 seconds**, with **148.5 MiB peak RSS**. This includes asset copying and parity verification; dependency installation is excluded. Further runtime reconstruction and final repeated benchmarks remain outstanding.

## Current implementation

Capgo Agent is now the primary project. It maintains already-converted HTML bodies and shared Nift includes; normal builds do not compile MDX. The homepage map, plugin directory, CLI demo, native-build explainer and UDID-result controllers are maintained readable vanilla JavaScript in `frontend/` and independently bundled with esbuild. Their original URLs remain compatibility identifiers, not hashes of the rebuilt files. The explicit manifest limits permitted JavaScript differences to these source-verified replacements. Other production controllers still await replacement and browser verification.

Both experiments use upstream `Cap-go/website` revision `7d5b69d6ba8a6630384dffc7d012431ee3ed22ec`. Capgo styling may include blue/light themes; the dark/no-blue rule applies only to the Labs report site. API workflows are permitted, with provider/backend limitations documented separately.

See `HANDOVER.md`, `GAMEPLAN.md`, and `docs/RUNTIME-CONTRACT.md`. The faithful closure report is in the sibling Capgo repository.
