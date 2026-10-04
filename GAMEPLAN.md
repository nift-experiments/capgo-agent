# capgo-alt — implementation gameplan

**All 23 checkpoints are pending. Implementation requires user approval.**
Read HANDOVER.md, UPSTREAM.md and provenance.json first. Each checkpoint ends
with acceptance evidence, a small Git commit and a handover update. Dependencies
flow in order; do not skip corpus/functionality gates to advertise benchmarks.
The ordered list is adapted to the pinned Capgo monorepo and latest user changes.

## CP01 — Pin baseline and corpus contract

- [ ] Verify the recorded upstream and lock hashes, create a disposable detached upstream checkout, record license/attribution and select exact runtime patches. Agree one inclusion/exclusion manifest and runtime capability vocabulary shared with the sibling experiment. Acceptance: documented pin verification and no divergent source snapshot.
- [ ] Save evidence, commit this checkpoint, and update handover status.

## CP02 — Reproduce upstream build

- [ ] Install the frozen lock with Bun 1.4.2 and chosen Node 24 patch, build docs and web without deploying, record command/env/logs and generated artifact inventory. Identify required public API responses; capture authorised public snapshots or record missing ones. Acceptance: a reproducible baseline or explicit blockers; no timing campaign yet.
- [ ] Save evidence, commit this checkpoint, and update handover status.

## CP03 — Inventory routes and content semantics

- [ ] Enumerate published slugs, docs, marketing routes, category/index families, plugin mappings, redirects and raw/LLM outputs. Capture expected heading/code/text/image/link semantics. Acceptance: collision-free exact route manifest and classified exclusions, not source-file-count guesses.
- [ ] Save evidence, commit this checkpoint, and update handover status.

## CP04 — Define API and runtime contract

- [ ] Audit interactive pages and decide supported own-API capabilities, schemas/auth/CORS/base URL behavior, external services and preview fallbacks. Specify local run/deployment topology. Acceptance: per-feature success/setup/error contract and documented unavailable production services.
- [ ] Save evidence, commit this checkpoint, and update handover status.

## CP05 — Define normalized schema and ownership

- [ ] Choose limited semantic blocks and page/route/navigation metadata; specify importer-owned records versus agent overrides. Acceptance: schemas include provenance, headings, assets and update merge behavior; no generic CMS framework.
- [ ] Save evidence, commit this checkpoint, and update handover status.

## CP06 — Prove semantic conversion

- [ ] Parse representative MD/MDX into blocks, map Starlight components and runtime descriptors, preserve code/examples/images/links/tables. Acceptance: audited fixtures match source semantics; unknown JSX/expressions fail with location, never silently flatten/drop.
- [ ] Save evidence, commit this checkpoint, and update handover status.

## CP07 — Define agent update/import workflow

- [ ] Design one mechanical SHA-pinned importer with stable ordering, source hashes, dry-run diffs and idempotent output. Acceptance: additions/changes/removals visible, overrides preserved and sibling corpus manifest remains equal.
- [ ] Save evidence, commit this checkpoint, and update handover status.

## CP08 — Create minimal Nift project

- [ ] After approval define ordinary public output, explicit templates, page wrappers and Nift-native metadata inputs. Acceptance: representative normalized pages full/incremental/targeted-build with working root/prefix paths.
- [ ] Save evidence, commit this checkpoint, and update handover status.

## CP09 — Implement full corpus normalization

- [ ] Import English published corpus and marketing informational data; produce semantic records/Nift fragments, assets and capability descriptors. Acceptance: source hash closure and exact shared content inclusion, no hand-duplicated article bodies.
- [ ] Save evidence, commit this checkpoint, and update handover status.

## CP10 — Generate tracking, navigation and indexes

- [ ] Generate .nift/tracked.json from checked routes plus compact category/tag/plugin/TOC/LLM/raw outputs. Track per-page record/source/adapter deps. Acceptance: collisions rejected and one-record edit does not force unrelated pages.
- [ ] Save evidence, commit this checkpoint, and update handover status.

## CP11 — Complete page families and route mapping

- [ ] Render docs/articles/plugins/marketing through few templates; maintain original-to-alt route mapping and explicit redirect aliases. Acceptance: full agreed route count and semantic coverage without importing Astro layout conventions.
- [ ] Save evidence, commit this checkpoint, and update handover status.

## CP12 — Design Capgo-inspired alternative layouts

- [ ] Use task-oriented navigation and simpler layouts while staying in Capgo visual family. Light/dark and blue allowed. Acceptance: professional homepage/docs/article/mobile samples and content hierarchy, with no visual-clone gate.
- [ ] Save evidence, commit this checkpoint, and update handover status.

## CP13 — Add small vanilla interaction modules

- [ ] Accessible menus, TOC/copy/tabs/theme; data-driven questionnaires and JS pagination where needed. Acceptance: modules have obvious ownership, no framework hydration requirement and keyboard/fallback checks pass.
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

## CP17 — Certify semantic corpus coverage

- [ ] Compare normalized blocks/text/headings/code/images/links against source manifest and sibling. Reject skipped MDX or partial content. Acceptance: identical underlying informational corpus, only presentation differences or reviewed exclusions.
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

## CP21 — Freeze controlled benchmarking

- [ ] Use same inclusion and API snapshots as similar; declare normalized-preprocessing versus render-only costs and caches. Acceptance: source edit measured through conversion, equal output assembly work and stable measurement environment.
- [ ] Save evidence, commit this checkpoint, and update handover status.

## CP22 — Measure controlled authoring/agent comparison

- [ ] Run upstream/similar/alt full/warm/no-change/edit/target/fan-out scenarios plus memory/footprint/output counts. Acceptance: same hardware, valid corpora, raw evidence and clear performance impact of representation choices.
- [ ] Save evidence, commit this checkpoint, and update handover status.

## CP23 — Prepare Labs evidence and release handover

- [ ] Publish reviewed methodology/maintenance findings, suggest Labs report data using dark/no-blue there only, record functional gaps and import/update recipe. Acceptance: fresh reproduction, truthful comparison and final documentation.
- [ ] Save evidence, commit this checkpoint, and update handover status.

