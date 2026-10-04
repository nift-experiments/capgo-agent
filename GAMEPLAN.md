# capgo-agent — implementation gameplan

**Implementation authorized 4 October 2026. Checkpoints proceed until completion; evidence is required before marking acceptance.**
Read HANDOVER.md, UPSTREAM.md and provenance.json first. Each checkpoint ends
with acceptance evidence, a small Git commit and a handover update. Dependencies
flow in order; do not skip corpus/functionality gates to advertise benchmarks.
The ordered list is adapted to the pinned Capgo monorepo and latest user changes.

## Shared component and evaluation rules

Progress from static HTML to CSS to vanilla JS; use a local framework island only
when complex state materially makes it clearer/smaller to maintain. Do not
preselect React/Vue/Svelte/Solid or force technology differences between siblings.
For each island record the reason vanilla was not preferable, runtime, scope,
hydration/client bundle cost, state ownership, API boundary and independent tests.
Menus/theme/tabs/copy/TOCs/simple filtering/pagination remain vanilla JS.

Keep build/system and maintenance/agent evaluation separate, comparing
upstream / capgo / capgo-agent on equivalent corpus/functionality and tasks.
Build scenarios: clean/full, warm/full, no-change, one content edit, targeted
build, shared-layout fanout, memory, dependency/install footprint, output size.
Maintenance tasks: docs page, global navigation, shared component, new content
type, stateful feature, source→output trace, seeded bug and cross-cutting visual
change. Record success/correctness, turns, context/tokens where measurable,
files inspected/modified, failed builds/tests, unnecessary edits, intervention,
architecture explanation and preferred codebase/reasons. Freeze model/tool/start
conditions and equivalent acceptance tests before runs. Run the final evaluation only after implementation correctness gates pass.

## CP01 — Pin baseline and corpus contract

- [x] Verify the recorded upstream and lock hashes, create a disposable detached upstream checkout, record license/attribution and select exact runtime patches. Agree one inclusion/exclusion manifest and runtime capability vocabulary shared with the sibling experiment. Acceptance: documented pin verification and no divergent source snapshot.
- [x] Save evidence, commit this checkpoint, and update handover status.

## CP02 — Reproduce upstream build

- [x] Install the frozen lock with Bun 1.4.2 and chosen Node 24 patch, build docs and web without deploying, record command/env/logs and generated artifact inventory. Identify required public API responses; capture authorised public snapshots or record missing ones. Acceptance: a reproducible baseline or explicit blockers; no timing campaign yet.
- [x] Save evidence, commit this checkpoint, and update handover status.

## CP03 — Inventory routes and content semantics

- [x] Enumerate published slugs, docs, marketing routes, category/index families, plugin mappings, redirects and raw/LLM outputs. Capture expected heading/code/text/image/link semantics. Acceptance: collision-free exact route manifest and classified exclusions, not source-file-count guesses.
- [x] Save evidence, commit this checkpoint, and update handover status.

## CP04 — Define API and runtime contract

- [x] Audit interactive pages and decide supported own-API capabilities, schemas/auth/CORS/base URL behavior, external services and preview fallbacks. Specify local run/deployment topology. Acceptance: per-feature success/setup/error contract and documented unavailable production services.
- [x] Save evidence, commit this checkpoint, and update handover status.

## CP05 — Define agent-first maintained schemas and ownership

- [x] Choose few explicit semantic blocks and page/route/navigation metadata; retain original MD/MDX for provenance while agent-owned records/overrides have an obvious maintained home. Specify deterministic importer reconciliation, predictable naming and small mechanically validated files. Acceptance: provenance/headings/assets complete and updates preserve agent edits; no MDX long-term authoring requirement or generic CMS.
- [x] Save evidence, commit this checkpoint, and update handover status.

## CP06 — Prove provenance-preserving semantic conversion

- [x] Parse representative upstream MD/MDX into validated semantic records, map Starlight components and runtime descriptors, preserve code/examples/images/links/tables. Retain source for update reconciliation; ordinary agent edits must not require Astro/Starlight/MDX knowledge. Acceptance: audited fixtures match source semantics; unknown JSX/expressions fail with location, never silently flatten/drop. No dependency on production mdx.html unless independently justified.
- [x] Save evidence, commit this checkpoint, and update handover status.

## CP07 — Define agent update/import workflow

- [ ] Design one mechanical SHA-pinned importer with stable ordering, source hashes, dry-run diffs and idempotent output. Acceptance: additions/changes/removals visible, overrides preserved and sibling corpus manifest remains equal.
- [ ] Save evidence, commit this checkpoint, and update handover status.

## CP08 — Create minimal Nift project

- [ ] Define ordinary public output, explicit templates, page wrappers and Nift-native metadata inputs. Acceptance: representative normalized pages full/incremental/targeted-build with working root/prefix paths.
- [ ] Save evidence, commit this checkpoint, and update handover status.

## CP09 — Implement full corpus normalization

- [ ] Import English published corpus and marketing informational data; produce semantic records/Nift fragments, assets and capability descriptors. Acceptance: source hash closure and exact shared content inclusion, no hand-duplicated article bodies.
- [ ] Save evidence, commit this checkpoint, and update handover status.

## CP10 — Generate tracking, navigation and indexes

- [ ] Generate .nift/tracked.json from checked routes plus compact category/tag/plugin/TOC/LLM/raw outputs. Track per-page record/source/adapter deps. Acceptance: collisions rejected and one-record edit does not force unrelated pages.
- [ ] Save evidence, commit this checkpoint, and update handover status.

## CP11 — Complete explicit page families and route mapping

- [ ] Render docs/articles/plugins/marketing through a few explicit Nift templates; maintain original-to-capgo-agent route mapping and redirect aliases. Acceptance: full shared content/functionality coverage with obvious data/template ownership and no forced divergence from capgo technologies.
- [ ] Save evidence, commit this checkpoint, and update handover status.

## CP12 — Design Capgo-appropriate agent-oriented layouts

- [ ] Recreate close Capgo visual and behavioral fidelity, matching the sibling externally while keeping normalized ownership internally. Do not deliberately simplify or redesign navigation/layout. Light/dark and blue allowed, and both siblings may share visual identity. Acceptance: clear homepage/docs/article/mobile hierarchy and predictable implementation; design freedom serves maintenance rather than a different palette.
- [ ] Save evidence, commit this checkpoint, and update handover status.

## CP13 — Add explicit vanilla modules and justified islands

- [ ] Accessible menus/TOC/copy/tabs/theme/simple filtering and JS pagination use vanilla modules. Assess complex stateful questionnaires/workflows under the shared island rule; any React/Vue/Svelte/Solid/etc. island records rationale/runtime/scope/hydration cost/state/API/tests. Acceptance: obvious local ownership, independent tests, keyboard/fallback checks and no site-wide framework adoption by default.
- [ ] Save evidence, commit this checkpoint, and update handover status.

## CP14 — Generate local search and code/media enhancements

- [ ] Build compact per-section search data from blocks; pin bounded code/diagram preprocessing and lazy enhancement. Acceptance: meaningful matches, stable code text, image/diagram alt fallback and documented tool cost.
- [ ] Save evidence, commit this checkpoint, and update handover status.

## CP15 — Implement replaceable own-API runtime

- [ ] Provide capability schemas, example config, server-only secrets, local adapter/router where necessary and own-provider integration for chosen metrics/plans/forms/tools. Acceptance: fixture contract tests and real configured provider sample work; unconfigured features are honest.
- [ ] Save evidence, commit this checkpoint, and update handover status.

## CP16 — Close output and asset contracts

- [ ] Generate sitemap/robots/canonicals/404, verify prefix-aware fetch paths, assets and static/runtime redirects. Acceptance: no unintended missing assets/routes/fragments; output metadata stable and alias counts separate.
- [ ] Save evidence, commit this checkpoint, and update handover status.

## CP17 — Certify equivalent corpus and functionality

- [ ] Compare normalized blocks/text/headings/code/images/links/runtime capabilities against source manifest and capgo. Reject skipped MDX or partial content. Acceptance: materially equivalent underlying content/functionality, with representation/navigation/presentation differences and exclusions explicit; preserved provenance and maintained record edits remain reconcilable.
- [ ] Save evidence, commit this checkpoint, and update handover status.

## CP18 — Certify maintenance and usability

- [ ] Agent adds/updates a fixture via documented input ownership; converter, dependency rebuild and validator explain results. Browser keyboard/responsive/accessibility/API setup/error checks pass. Acceptance: clear deterministic workflow and no hidden edits.
- [ ] Save evidence, commit this checkpoint, and update handover status.

## CP19 — Verify downloadable operation

- [ ] From fresh clone, import/build offline from pinned artifacts, configure sample own API and run full app; document runtime host setup and version pins. Acceptance: no private upstream credentials or required upstream worker deployment.
- [ ] Save evidence, commit this checkpoint, and update handover status.

## CP20 — Prepare optional Pages/runtime deployment

- [ ] Add preview Actions and separate full-runtime recipe; verify prefix/root, robots and artifact limits. Acceptance: frozen Pages preview useful while service-backed mode is deployable on a real server-capable target.
- [ ] Save evidence, commit this checkpoint, and update handover status.

## CP21 — Freeze build and maintenance comparison protocols

- [ ] Use same inclusion/API snapshots as capgo; declare normalized preprocessing versus render-only costs and caches, equal output work and stable environment. Freeze equivalent maintenance tasks/model/tool settings/start states/correctness tests for upstream / capgo / capgo-agent. Acceptance: both dimensions reproducible and no hidden conversion cost or final evaluation during planning.
- [ ] Save evidence, commit this checkpoint, and update handover status.

## CP22 — Measure separate build and agent-maintenance results

- [ ] Run controlled upstream / capgo / capgo-agent full/warm/no-change/edit/target/fanout scenarios with memory/install/output counts, then equivalent maintenance tasks under the frozen protocol. Record task success/turns/context/files/failures/unnecessary edits/intervention/architecture explanation/preference. Acceptance: valid corpora, equivalent correctness gates, raw evidence and separate analysis of build costs and maintenance outcomes.
- [ ] Save evidence, commit this checkpoint, and update handover status.

## CP23 — Prepare Labs evidence and release handover

- [ ] Publish reviewed methodology/maintenance findings, suggest Labs report data using dark/no-blue there only, record functional gaps and import/update recipe. Acceptance: fresh reproduction, truthful comparison and final documentation.
- [ ] Save evidence, commit this checkpoint, and update handover status.


## Current implementation decisions

Both sites target close Capgo visual/behavioral fidelity and the same pinned corpus, route policy, assets and API snapshots. The distinction is maintenance architecture, not visual design. Preserve the 22/23 checkpoint skeletons; investigate intermediate failures and continue. Full corpus, runtime, fresh-clone, targeted visual, build and maintenance evidence are required. MDX compiler-preparation is approved by the current user outline; 8–15 s / 1–2 s remain provisional until measured. Fallback normalization is permitted only with an evidenced decision. Labs dark/no-blue stays separate. No core edits.
