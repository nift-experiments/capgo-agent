# Capgo Agent — golden-reference migration

The current local preview renders all 1,347 routes from maintained HTML bodies and shared Nift includes. Normal builds do not compile MDX. The earlier prototype is archived in `docs/prototype` and its generated output is preserved locally under `build/archive`.

This is the Phase 8 baseline, not the finished vanilla implementation: production CSS, assets and JavaScript remain intact until their behavior is reconstructed and checked against the golden reference.

```sh
npm ci --ignore-scripts
NIFT=/path/to/nift node tools/build.mjs --all
node runtime/server.mjs
node tools/parity.mjs
```

Build threads default to `-1` (all available cores). Set `NIFT_BUILD_THREADS` to override. Preview: http://127.0.0.1:4173/. All 3,876 output files currently match the frozen production snapshot byte for byte.

The measured first build of this baseline took **3.66 seconds**, with **148.5 MiB peak RSS**. This includes asset copying and parity verification; dependency installation is excluded. Further runtime reconstruction and final repeated benchmarks remain outstanding.

# capgo-agent

Agent-first Capgo recreation with a normalized Nift content model.

**Planning only: no website has been implemented.** Stop before implementation
until the user has reviewed and approved the plan.

Both experiments use the same pinned [Capgo source](https://github.com/Cap-go/website/tree/7d5b69d6ba8a6630384dffc7d012431ee3ed22ec),
inspected on 4 October 2026. The current source inventory contains 1,193 authored
MD/MDX documents; rendered route count is not established yet.

These Capgo websites may use blue and light themes and should follow Capgo's
style family. The Labs report site alone has the dark/no-blue rule. There is no
static-only constraint: the planned downloadable project supports user-configured
APIs and ordinary runtime tooling. GitHub Pages is an optional static preview.

Read:

- [HANDOVER.md](HANDOVER.md): purpose, architecture, runtime and maintenance rules.
- [GAMEPLAN.md](GAMEPLAN.md): 23 ordered implementation checkpoints, none complete.
- [UPSTREAM.md](UPSTREAM.md): observed architecture, corpus and open constraints.
- [provenance.json](provenance.json): exact upstream SHA, lock digest and measured inventory.

Sibling: https://github.com/nift-experiments/capgo

No Nift core or unrelated package changes are in scope. No permanent upstream
fork, dependency installation, benchmark campaign or deployment was performed in
this planning phase.

The distinction is maintenance model, not forced visual or technology divergence.
Prefer HTML/CSS/vanilla JS; isolated framework islands are allowed for materially
complex stateful UI, with documented boundaries, costs and tests. Build/system
and equivalent maintenance/agent evaluations are separate future goals.

Upstream MD/MDX stays available for provenance; validated normalized records
may be the maintained source without requiring MDX as the authoring format.
