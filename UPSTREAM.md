# Pinned upstream investigation

Inspected on **4 October 2026 (Australia/Melbourne)**. Repository:
https://github.com/Cap-go/website

Exact reference: `7d5b69d6ba8a6630384dffc7d012431ee3ed22ec`.
Browse: https://github.com/Cap-go/website/tree/7d5b69d6ba8a6630384dffc7d012431ee3ed22ec

The machine-readable pin and inventory are in `provenance.json`. Inspection used a
shallow temporary checkout, not a permanent fork and not a source import into
these experiments. No upstream dependency installation, build timing, or final
benchmark was performed. Current production pages were also inspected, but may
change independently of this SHA; use the pinned checkout for reproduction.

## Actual architecture

A Bun workspace has `apps/web` (marketing, blog/articles, plugin tutorials),
`apps/docs` (Starlight documentation), shared Astro configuration under
`apps/shared`, and supporting workers including translation, distribution and
other integrations. Both inspected Astro app configs select static build output;
Cloudflare Workers add request-time behavior around those outputs. This does
not mean the whole production site is independent of a server.

Key source paths:

- `apps/web/src/content/blog/en/`: 508 MD + 7 MDX = 515 source documents.
- `apps/web/src/content/plugins-tutorials/en/`: 149 MD source documents.
- `apps/docs/src/content/docs/docs/`: 10 MD + 519 MDX = 529 source documents.
- `apps/web/src/pages/`: 104 Astro + 2 TS route source files, including dynamic
  blog/plugin/category families; a route template is not one output page.
- `apps/web/src/content.config.ts`: schemas, published state, slugs, origin,
  locale, tags, FAQ metadata. `published !== false` filtering matters.
- `apps/docs/src/content.config.ts`: Starlight loader/schema.
- `apps/docs/src/config/sidebar.mjs`: explicit documentation navigation.
- `apps/web/src/config/plugins.ts`: registry driving directories/tutorials.
- `apps/web/src/layouts/Layout.astro`, `src/components/`, `src/copy/`,
  `src/services/`, shared metadata/link helpers: marketing layout and data.
- `apps/web/public/`: 1,674 files measured; docs synchronises public assets via
  `apps/docs/scripts/sync_public.ts`. Also inventory imported `src/assets` and
  colocated docs images; do not count public assets as the entire asset closure.
- `apps/web/src/worker/`, `apps/docs/src/worker/`, and
  `apps/translation-worker/`: runtime routing and services.

The **1,193 documents are source files, not a certified public page count**.
Duplicate slugs, publication flags, category/index pages, homepage/marketing
pages, generated families, and redirects affect actual route totals. Establish
an exact manifest only after the frozen upstream baseline builds. English is
the checked-in content corpus at this pin. Do not multiply it by nine to claim
translated authored pages.

## Toolchain and reproduction recipe

Root manifest: Astro 7.3.4, Starlight 0.42.3, `@astrojs/mdx` 8.0.2,
Cloudflare adapter 14.3.3, Tailwind ^4.3.3. Other relevant declarations include
Starlight DocSearch 0.8.0, Mermaid ^12.0.0, sitemap integration 3.7.4, Sharp
^0.35.4 in app manifests, Supabase client, and Wrangler 4.137.0. Resolve exact
transitive versions from the pinned `bun.lock`, not semver declarations.
Root declares 27 dependencies, 36 dev dependencies and 2 optional dependencies;
web declares 3 dependencies/1 dev dependency, docs 13/5. These overlap; they
are not an installed unique-package count. Supporting worker packages add more.

CI uses Bun **1.4.2** and Node **24 / 24.x**. An exact Node patch must be selected
and recorded in the baseline environment; do not pretend CI specifies one.
Bun lock SHA-256: `2b78f1197a0437af9d1f233b4d9fc74cf28fb67e7dc9843474fa7fc774bad415`.

Future reproduction, after implementation approval, in a separate upstream
checkout at this SHA:

```sh
bun install --frozen-lockfile
bun run build
# Or isolate each app:
bun run build:docs
bun run build:web
```

The root full-build script cleans app build/cache directories, then builds docs
and web. Web's script cleans its build state, runs Astro with default
`NODE_OPTIONS=--max-old-space-size=16384`, `BUILD_CONCURRENCY=1` and
`UV_THREADPOOL_SIZE=16`, then removes `dist/.prerender`. Docs synchronises public
assets and uses the same defaults. Run only in a disposable baseline checkout;
never run upstream cleanup scripts against the experiment repositories.
Record actual overrides and environment. Outputs are separate app `dist/`
trees, not a single root artifact. Deployment is separate Wrangler commands;
do not invoke deployment to establish a build baseline.

## MDX and authored content

MDX is substantial: 526 files overall. 242 docs MDX files and all seven web MDX
files exceed 4,096 bytes. Docs uses Starlight components (Aside, Steps, Card,
LinkCard, CardGrid, Tabs/TabItem, Code/FileTree), PackageManagers, MermaidGraph,
YouTubeEmbed, plugin-directory data and questionnaires. Web MDX imports
BlogMidArticleCta. Colocated images can be imported as component attributes.
Inventory real MDX syntax with a parser: code examples contain apparent imports
and JSX that are prose, not executable dependencies. A fence-aware exploratory
scan found 137 docs import lines from Starlight components; this is a heuristic,
not a complete AST compatibility certificate.

The current Nift `mdx` production package is still a bounded preservation parser,
not an HTML renderer. Its dedicated investigation proved the composition
`mdx.html(mdx.input(...))` in an isolated prototype. The next package task must
implement/certify a batched rendering path, lightweight pure parse/input use,
ordinary static HTML without browser React/JSX, transitive Nift dependencies,
trusted-build limits and parser performance, component adapters, execution policy,
diagnostics, adapter invalidation and Linux/macOS/Windows portability. React
`renderToStaticMarkup` may be a replaceable build-time implementation detail;
the public abstraction remains MDX document → HTML, not React components.

Measured prototype rendering of 100 realistic fixtures took 41.35s with separate
processes versus 1.44s batched (renderer-only, not full corpus builds). Canonical
docs MDX count 519; 242 exceed4KB, max43,342B. These findings require batching as
the normal production architecture and a measured trusted-build parser profile;
they are not Capgo benchmark results. Package investigation and implementation
checklist: https://github.com/nift-packages/mdx/tree/main/investigation

`capgo` preserves MD/MDX/frontmatter where practical and depends explicitly on
that package certification before its MDX integration checkpoint. Do not create
a second independent Capgo MDX renderer without an evidenced package blocker.
Capgo-owned Starlight/Astro adapters remain appropriate. `capgo-agent` ingests the
same sources with provenance but can maintain validated normalized semantic
records rendered by explicit Nift templates; it does not require MDX as its
long-term representation. Keep original sources available for reconciliation.
Neither website nor MDX production work begins during this rename task. Do not
modify Nift core. Nift native `@markup` handles Markdown, not arbitrary MDX;
its evaluated template sigils require a tested escaping/opaque insertion boundary.

## Routes, discovery, and runtime boundaries

Trailing slashes are configured. Docs live under `/docs/`; blog post routes use
frontmatter slugs, with `/blog/` and `/articles/` listings distinguished by
human/AI origin. Plugin routes derive from registry/tutorial mapping.
Generated surfaces include categories, `plugins.json`, `plugins.md`, sitemaps,
raw docs Markdown copies, `llms.txt`/`llms-full.txt` and custom docs sets.
Assets use `_astro` (web) and `_docs` (docs). Inventory alias rewrites before
merging artifacts. Sitemap integration uses last-modification helpers and also
a current-date fallback; freeze that fallback for deterministic comparison.

Docs config has four explicit redirects; docs worker has additional legacy and
case-sensitive redirects, and web public has `_redirects`. Enumerate the union;
Pages does not execute these worker rules. Optional Pages preview needs HTML
redirect stubs with visible links (no claim of HTTP 301 parity). A full runtime
can implement real status codes via an adapter.

Locale services list en, de, es, fr, id, it, ja, ko, zh. Current translations are
served at request time by an edge worker; English authored sources are public.
No frozen complete set of translated responses is established by this inspection.
Plan English as the shared reproducible benchmark corpus. Full-download mode
may add user-configured translation, or later lawful captured translations with
provenance. Never fabricate translated pages or advertise unavailable locales.

Docs search uses hosted Algolia DocSearch; Pagefind is disabled. Do not reuse the
upstream hosted index as if it indexed the experiment URLs. Proposed search is
local generated text data + vanilla JS, optionally a user-owned search provider.
Code highlighting uses Starlight Expressive Code with `github-dark`; diagrams
use Mermaid. Static HTML/code first, optional lazy browser enhancement, no lost
code text if an enhancement fails.

Production runtime features include pricing/plans/credits, app rankings, live
update/build metrics, registration/Turnstile/Supabase, forms, tools (including
UDID processing), MCP/agent discovery, content negotiation, dynamic banners and
translation. Some build paths fetch public service responses. Authenticated
console functionality is a different application. Feature-by-feature behavior
must be mapped to a local adapter, configured external API, frozen snapshot,
or explicit external link; retaining a button without working behavior is not
functional recreation.

Public code and English corpus are available (AGPL-3.0 source notice). Production
service data, credentials, private account APIs, signing certificates, and the
complete translation cache are not supplied by this repository. Preserve source
license/attribution on import; do not imply that all production backend data is
public or that these experiments are endorsed by Capgo. Later fetches should be
public snapshots or user-authorised APIs, not private Capgo credentials.

## Implementation authorization update

4 October: implementation now authorized. Historical planning-only statements above describe the inspection phase. MDX production rendering is implemented; the compiler-semantic preparation path is approved and remains to be built/certified. Proper Nift file-type APIs have landed locally. Shared corpus pin is unchanged; CP01 evidence and active HANDOVER govern current work.
