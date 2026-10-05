# Agent interaction evidence — Checkpoint B

Reference: the pinned official Capgo source's production build (`7d5b69d6ba8a6630384dffc7d012431ee3ed22ec`), served directly from its output. Faithful Nift was not used as the behavioural oracle. This is bounded representative verification, not proof that every route, device, external service and authenticated workflow works.

`evidence/interaction-matrix/route-rendering.json` records the actual DOM viewport dimensions for 13 route classes: homepage, pricing, Native Build product, agencies solution, Ionic Appflow comparison, docs landing, normal docs, rich docs, blog listing, blog article, live-data/API page, privacy/legal and SemVer. Agent and upstream screenshots are paired under `screenshots/`. Desktop viewport was 1280×720 and mobile 390×844. Captured images exclude browser chrome/scrollbar areas. An initial ineffective mobile override was detected from `innerWidth`, discarded, and replaced with correctly sized captures.

All 26 Agent render samples fit their viewport. Desktop samples contained no completed broken images. Pixel samples compare the initial viewport only: 18/26 pairs have zero pixels differing by more than 24 RGB levels; the remaining fractions range up to 0.992% (mobile homepage). Animations, asynchronous content and capture timing are not disabled; this is not an assertion of exact full-page pixel parity. Route HTML/DOM parity is separately checked across all 1,347 routes.

| Interaction | Observation | Evidence / limit |
| --- | --- | --- |
| Desktop navigation | Products menu exposes product links | Browser observed actual dropdown; homepage screenshot |
| Mobile navigation | Expand menu → Products → Native Build navigates and closes menu | `mobile-menu-open.txt`, `mobile-products-open.txt`, `mobile-navigation-result.txt` |
| Accordion | “Has Apple ever flagged Capgo?” reveals the explanatory text | `home-accordion.txt`; semantic details/summary |
| AI choice control | Selecting Claude changes Ask link to claude.ai with encoded prompt | Local selection only; destination was not opened |
| Pricing/product controls | Monthly billing selected; calculator opens focused on close button; 100k MAU / 1 update / 4MB recommends Team $99/mo | `pricing-calculator.txt`; initial total waits on external credit endpoint, not claimed completed |
| Docs search | `rollback` returns five ranked Algolia hits; ArrowDown changes selected hit; Escape closes modal | `docs-search-results.txt`; external index remains a dependency |
| Copy buttons | Deploy page copies `npm run build` | Browser clipboard read matched command |
| Tabs/keyboard/focus | Console → Github Actions; ArrowRight selects/focuses Gitlab and swaps visible panel | Browser observed selected tab and YAML panel |
| Rich diagram | Mermaid renders an SVG, without logged JavaScript errors | Rich docs route captures and DOM inspection |
| Rich questionnaire | Android reveals existing CI/service-account/keystore question | `docs-questionnaire.txt` |
| Mobile TOC | Opens heading links, navigates to Understanding the Build Process anchor, closes dropdown | `mobile-toc-open.txt`, `mobile-toc-result.txt` |
| Language switching | FR navigates to matching French path | `docs-language-fr.txt`; that translated rich page is missing in both upstream and Agent, preserving its 404 rather than inventing content |
| Blog search/filter | Nonmatching query removes article cards; Capacitor query restores matching cards | `blog-search-empty.txt`, `blog-search-results.txt`; filters currently rendered listing rather than claiming whole-corpus remote search |
| SemVer | 1.0.0 → 1.0.1 applies update; `bad` displays invalid format and blocks comparison | `semver-valid.txt`, browser observed invalid state |
| Form validation | Empty CSR form focuses required Full name with “Please fill out this field.” | `csr-empty-validation.txt`; no API submission |
| Registration | Fields/review carousel render; Sign up starts disabled while service configuration loads | No credentials, account creation, captcha or terms acceptance performed |
| Data-driven page | Controller exposes unavailable state, rather than fabricated live results | `data-runtime.txt`; upstream static build has same unavailable state |
| Legal/blog/solution/comparison | Representative pages render with preserved content and responsive layout | Paired screenshots and AX snapshots |

Remaining production verification: successful private signing/device workflows, real registration, complete credit-calculation response, live metrics delivery, certificate upload/conversion in the browser, every mobile keyboard/focus edge case and external testimonial availability. These are explicit limits; they are not counted as successful end-to-end tests. Controller source recovery is complete, but this evidence does not authorize a claim that Agent replaces Capgo's production backend.
