# Capgo three-way experiment — final comparison

The pinned English production frontend can be reproduced with Nift while preserving its appearance, routes and content. Faithful Capgo preserves the authoring corpus and regenerates MDX/Markdown bodies and metadata; Agent maintains converted HTML with shared Nift structure and independently compiled readable browser controllers. These are bounded frontend migrations, not recreations of Capgo’s private services.

## Fixed inputs and measured results

Upstream is official `Cap-go/website` at `7d5b69d6ba8a6630384dffc7d012431ee3ed22ec`. Faithful is closed at `590c1eec`; no further faithful refactoring was performed for this phase. Agent browser/native architecture is `fbc7bb5`, with the permitted incremental-dependency correctness correction at `6371356`, the exact repeated benchmark revision. Final evidence/docs commits do not change this architecture. AGPL source attribution and bundled dependency licences remain.

| Local workload | Original Astro | Faithful Nift | Agent Nift |
|---|---:|---:|---:|
| Warm full median | 106.09s (5 runs) | 5.67s (3) | 2.23s (3) |
| Full range | 92.18–124.61s | 5.56–5.67s | 2.21–2.34s |
| Maximum process RSS, full | 3.61 GiB | 235.8 MiB | 101.7 MiB |
| No-op median | Not measured | 4.60s | 1.08s |
| Docs edit median | Not measured | 5.78s | 1.08s |
| Rich docs edit median | Not measured | 6.41s | 1.06s |
| Product/marketing edit median | Not measured | 4.28s | 1.09s |
| Blog edit median | Not measured | 4.35s | 1.04s |
| Cold content intermediates median | Not separated | 81.29s / 667.1 MiB | No MDX/content intermediate generation |

Measured full-build elapsed ratios are approximately 18.7× upstream/faithful, 47.6× upstream/Agent and 2.5× faithful/Agent. These describe the recorded workflows, not equivalent-work compiler speed. Astro rebuilds frontend bundles and renders authored content. Faithful reuses compiled frontend assets and, warm, prepared MDX/content. Agent keeps already-converted HTML, retains production CSS/images/fonts, and independently bundles native JS on each normal Nift invocation. Thus Agent’s content work is smaller than faithful’s. Its incremental edits are HTML edits; faithful’s edit families are authored MDX/Markdown/marketing inputs, not identical edits.

All Nift timings use ordinary full or incremental CLI builds, threads `-1`, installed Nift 4.6.0 on Intel i7-12700H / 20 logical CPUs. GNU time RSS means maximum process memory, not simultaneous process-total memory. Dependency install and edit restoration are excluded. Node 22.22.1 for Nift, Bun 1.4.2 / Node 24.21.0 for upstream. Same recorded Nift binary hash; source commit is unavailable and explicitly not invented. Warm system page cache is not flushed. Raw Agent methodology, commands, source/output edit verification and measurements: `../evidence/final-benchmarks/`; faithful/upstream evidence remains in the frozen faithful repo. The historical 1.98s single Agent sample is superseded. Faithful’s earlier 4.40s versus final 5.67s difference remains in its report; this comparison does not erase it.

## Fidelity and runtime

All three share the 1,347 captured HTML routes. Agent verifies every retained file plus all rebuilt native assets and exact HTML bytes. Faithful reports exact parsed heads and semantic body equivalence, with 1,192 accepted body-byte differences. Both report zero introduced semantic/link issues; the oracle’s 11,339 existing link/anchor issues are preserved. Missing translated destinations remain upstream quirks, not invented local routes.

Agent’s representative browser matrix covers 13 page classes at desktop/mobile, production output as oracle, plus navigation, search, tabs, copy, TOC, forms, pricing, language choices and keyboard/focus checks. Eighteen of 26 paired viewport screenshots have no thresholded pixel difference; other differences are under 1%, including animation timing. This is representative evidence, not exhaustive full-page or accessibility certification. Search returned actual Algolia results; data-unavailable states match the reference. External service content and availability can change.

Account creation, authenticated workflows, device identifiers, genuine signing success and browser certificate upload/download remain uncertified. No accounts or external messages were created. Agent’s allowlisted provider adapter has local mock tests for method/schema/errors and token forwarding, and can connect compatible own services; it does not implement those services. See `INTERACTION-MATRIX.md`, `CLEAN-CHECKOUT.md` and `NATIVE-ARCHITECTURE.md` for exact evidence and own-provider configuration. Faithful’s original signing/device server routes remain unsupported locally and its earlier adapter does not automatically reconnect retained controllers. Static parity is never proof of backend success.

## What machinery changed

Agent maintains 1,347 Nift wrappers, 1,881 shared HTML includes, 5,990 converted HTML fragments and six templates/helpers. Wrapper bytes are 11,474,495 after explicit dependency declarations; include and fragment bytes are 24,595,477 and 70,519,275. Converted markup is substantial maintained source, not a compact hand-written content model. Thirty-seven readable JS files (290,686 bytes) supply all 21 recovered entry controllers. No Astro build/runtime or React install is required; zero Astro hydration islands occur. Existing scope IDs remain for CSS parity.

DocSearch is the documented reactive exception: Preact compatibility supports its existing keyboard, focus, ranking, history and modal state. Wrapper initial JS is 1,644 bytes, complete reachable search graph 134,776 uncompressed bytes. Mermaid remains a specialised rendering dependency: initial graph 716,083 bytes, all reachable lazy modules 5,189,923 bytes, not all downloaded on every page. SDK/Supabase/crypto helpers remain explained dependencies. Inline production controllers/configuration and external analytics/testimonials are classified retained implementation, not claimed newly designed vanilla replacements.

The 103 unreferenced old JS assets (5,457,094 bytes) were removed from served output only after reference auditing; their oracle copies remain for evidence. All rebuilt Agent JS totals 6,082,284 bytes versus original 6,073,203 bytes: essentially the same, slightly larger. There is **no demonstrated overall client-JS reduction**. Upstream already compiled much of the site to ordinary HTML/JS. The gain is source/runtime accountability and removal of Astro from normal authoring/build prerequisites, not a fictitious removal of megabytes of hydration. All versions retain the original CSS/images/fonts; Agent retains 19 CSS files / 627,800 bytes.

Agent lockfile has 187 packages; installed regular dependency files total 228,622,975 bytes / 11,529 files (not allocated disk size or a network-download metric). Faithful root lock has 188 packages, but also uses the separate locked MDX renderer and other renderer inputs, so these root counts are not whole-system comparable footprints. Upstream’s monorepo/Bun workspace scope differs. Equivalent total install/download footprints were not measured; no percentage reduction is claimed. Full current accounting is `../evidence/runtime/architecture-audit.json`.

## Maintenance decision

Astro remains the strongest choice for maintaining the evolving original Capgo product: compact MDX/frontmatter authoring, component reuse, established Starlight/i18n integration and the existing ecosystem/service integration. Updating designs and content across a large corpus fits that source architecture. This experiment’s local production blockers argue against replacing it solely because another workflow builds faster.

Faithful Nift is the better Nift choice if preserving the MDX authoring model is the priority. It demonstrates migration with very high content fidelity and a faster measured development loop. Its adapters and retained compiled frontend require deliberate coordination when upstream components/styles change, and cold preparation is substantially slower than its warm headline. Choose it for an ongoing Nift migration of this corpus, while accepting that maintenance responsibility.

Agent is the better choice for a frozen/reusable frontend or an explicit HTML/vanilla authoring preference. Edits are directly inspectable, ordinary Nift dependencies are explicit, JS has readable maintained inputs, no normal MDX/Astro build is needed, and the measured edit loop is small. Its many HTML fragments, retained scoped CSS and bulk markup make rich corpus-wide revisions and upstream design syncing less ergonomic than MDX/components. It is not automatically the easiest long-term product to maintain.

For the real continuously evolving Capgo website we would retain upstream Astro today; for the faithful Nift corpus experiment we would maintain faithful Capgo. Keep Agent as the separate native implementation and reproducible comparison, with its compatible-provider setup available for downloaders. Both Nift architectures are closed at this bounded checkpoint. Further optimisation or redesign is a new phase, not silently folded into this evidence.
