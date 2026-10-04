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
