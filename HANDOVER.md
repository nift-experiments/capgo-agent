# capgo-agent — golden-reference migration handover

Current phase: Phase 8 baseline complete; Phase 9/10 native visual and behavior reconstruction pending.

The previous reconstruction failed visual fidelity: class stripping and broad substitute CSS broke layout, cards, decorative positioning, typography, logo grids, testimonial height, navigation and footer. Route completion did not certify fidelity. User screenshots demonstrate these regressions. Do not polish or accept this prototype as the target.

The authoritative upstream remains 7d5b69d6ba8a6630384dffc7d012431ee3ed22ec. Its successful full production output is the immutable golden oracle. Phase 1 inventories every output file; Phase 2 validates that output locally at mobile/tablet/desktop sizes; parity gates precede structural refactoring.

capgo first reproduces the complete compiled output through Nift, retains frontend assets as needed, then extracts templates and reconnects authored MDX. capgo-agent uses the same oracle but reconstructs a lean native presentation and vanilla behavior. Neither final project may be merely a copied build. No Nift core changes. Preserve Git history. Push authorized checkpoint commits.

Useful preserved work includes source provenance, normalized importer, generic MDX integration, component inventories, runtime contract, public snapshots, build logs, and incomplete adapters. Browser/runtime/production certification is pending. Old progress is archived in docs/prototype.

Phase 0 complete: useful prototype preserved in Git and superseded explicitly. Full pinned production build succeeds with recorded anonymous public API responses, including upstream Kotlin 404. See evidence/checkpoints/PHASE00.json and the build log. Phase 1 snapshot copied; inventory review and verification pending. No visual-parity claim yet.

Phase 1 complete: immutable full production snapshot, 3,876 files / 1,347 HTML routes. Every merged and original per-app file hash verified; four root collisions retain their original docs bytes. Metadata, scripts/styles, headings and complete per-app inventories are recorded. Use tools/golden.mjs to verify before migration builds. Phase 2 responsive/browser references underway; no final migration claim.

Phase 2 accepted: 13 representative routes captured at 375/768/1440px (39 observations). Golden screenshots include mobile/desktop menus, search and SemVer interaction. External network dependencies and one original mobile overflow are documented in PHASE02.json. No accounts or live form submissions were performed.

## 5 October — Phase 8 recovered baseline

Replaced the old prototype preview with 1,347 maintained HTML bodies and shared Nift header/footer/docs templates recovered from the faithful migration. No authored MDX is read during normal builds. Build threads are -1. Full byte/DOM/route parity passes for 3,876 files, with zero introduced link defects. First full build: 3.66s / 152040 KiB maximum RSS (148.5 MiB). Local preview remains port 4173. Golden frontend JavaScript is retained temporarily; Phase 9/10 vanilla reconstruction, final corpus audit and fair repeated benchmarks are not complete. Screenshot saved under evidence/parity/recovered-home.

5 October follow-up: all recovered baseline checkpoints through 9912502 are pushed to origin/main. Sequential installed /usr/local/bin/nift build --all: 1.06s / 65088 KiB RSS; this excludes the wrapper’s full golden hash/output validation. DOM parity now distinguishes element nesting as well as attributes/text. The vanilla runtime migration remains pending.

Build-time recheck: installed Nift is now 4.6.0, replacing the prior 4.5 binary. Three sequential full builds: Capgo 4.64/5.15/4.35s (median 4.64s); Agent 1.73/1.46/1.47s (median 1.47s). All pass, with 502 MDX cache hits. Warm code preparation 0.61–0.66s and MDX preparation 0.85–1.09s. Isolated same-binary comparison of previous496/current502 page structures with identical prepared inputs and preparation disabled: medians 1.94/2.03s, excluding initial warm-up. This does not reproduce the 16.55s outlier; exact zero regression cannot be claimed amid host compilation/browser load and the binary change. Evidence: evidence/build-progress/build-time-recheck-20261005.json.

## 6 October — native controller work active

Faithful Capgo closure/report is pushed at 590c1eec. Agent now maintains five recovered vanilla JS controllers plus world-map data under `frontend/`. Locked esbuild independently bundles these without Astro. `migration/native-controllers.json` lists exactly the replaced assets; the validator regenerates expected JS from source and rejects any other asset differences. Original asset URLs are compatibility identifiers, not hashes of the rebuilt files. Normal `nift build` also runs controller preparation. No MDX compilation is introduced. Plugin empty/category behavior and homepage map initialization are verified in the browser; remaining three rebuilt controllers need broader browser coverage. Other original controllers and docs search/runtime remain to be recovered or explicitly justified. Agent is not finished. Original UDID backend remains unsupported locally.

Native checkpoint clean reproduction passes: 6.26s / 157.9 MiB first wrapper build from revision 13d2a55. Direct full build including controller preparation observed 1.98s / 70.0 MiB. These are single observations, not final repeated benchmarks. Remaining controller reconstruction, broad responsive interaction coverage and final comparative benchmarks/report are outstanding.

## Agent Checkpoint A — controller recovery

All 21 browser entry modules now build from tracked JavaScript; exhaustive runtime accounting is in `docs/RUNTIME-RECOVERY.md` and `evidence/runtime/browser-inventory.json`. Full parity and entry/lazy-chunk corruption tests pass. Broad interaction matrix, retained-chunk pruning/audit, final clean checkout, freeze, repeated benchmarks and final comparison remain pending. Faithful stays frozen at `590c1eec`.
