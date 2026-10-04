# capgo-agent — project handover

## Purpose and principles

Use the same pinned Capgo informational corpus with an architecture designed for
Nift and agent maintenance. Content, routing, metadata, reusable layouts and API
adapters have obvious ownership and low conceptual overhead. Prefer vanilla
HTML/CSS/JavaScript and deterministic generation. Human editability remains
useful; agent maintainability takes priority. It is a working downloadable
application with configurable APIs, not static-only.

## Design direction

Follow Capgo's existing visual style family: recognizable product identity,
clear typography, developer-oriented content and restrained panels/cards.
Blue and light/dark themes are allowed. Layouts and navigation may be
reinterpreted substantially when that makes
agent ownership and maintenance clearer, while remaining appropriate for Capgo.
Design freedom serves the agent-oriented codebase; it is not a requirement for
a different palette or branding. Future agents retain creative latitude where
it supports understandable content and implementation. The Labs dark/no-blue
rule is for report pages only.

## Proposed architecture specific to this version

- `corpus/source/`: immutable imported MD/MDX and attribution for reproducible
  updates; do not keep the complete upstream repo/fork here.
- `content/`: generated but readable Nift-native page content, explicitly mapped
  from corpus source and authored overrides. Do not require people/agents to
  reconstruct information from page-shell HTML.
- `data/pages/`: normalized frontmatter and semantic document records.
  `data/routes.json`, `navigation.json`, `plugins.json`: stable shared metadata.
- `schemas/`: versioned page/route/block/API schemas with validated required
  fields and small extension escape hatches. A page record records source SHA,
  source file hash, title, logical route, locale, collection, metadata, ordered
  semantic blocks, headings, assets, links and component mappings.
- `templates/`: a few explicit marketing/docs/article layouts and semantic
  partials. `public/assets/`: simple vanilla styling/client modules and static
  assets; `tools/`: importer, normalizer, index and validation tools.
- `runtime/` and `config/`: optional provider adapters for real application APIs,
  isolated from corpus ingestion and layout rendering.

Use a parser-based build-time conversion from upstream MD/MDX to a small semantic
representation: Markdown/prose, code, aside, steps, card/link grid, tabs, media,
diagram and interactive feature descriptor. Preserve heading hierarchy, text,
code spelling, image captions/alt text, table cells, links and ordering. Do not
invent a general CMS or a universal MDX interpreter. CommonMark/GFM parsing and
JSX AST analysis may need pinned libraries in the importer; low dependencies
means justified boundaries, not regex-only parsing or silent data loss.

Explicitly evaluate only audited data/component mappings. Unsupported expressions
or imported components fail with a source location and a reviewable mapping
request. Content examples inside fences are inert. Preserve whole MDX source for
update/provenance even if rendering uses normalized blocks. Validated normalized
records are the maintained agent-oriented representation;
original MD/MDX remains provenance/update input, not mandatory authoring syntax.
Define an explicit home for agent edits/overrides and reconciliation; the importer
must preserve them rather than treating all maintained data as disposable cache.
Agents should not need Astro/Starlight/MDX knowledge for ordinary website changes.
A narrow HTML fragment block may be an audited fallback
with semantic-validation evidence, not the default opaque flattening of the corpus.

Navigation and indexes are generated from normalized metadata, not copied into
multiple templates. Stable route IDs tie original paths to capgo-agent paths.
Local search
can use section/block text without an MDX runtime. Code highlighting and diagram
preprocessing are optional bounded steps with separately measured cost. Build
should work offline on already imported records and configured snapshots. A fresh
import and an authored-source edit must run the converter and be timed separately
from render-only builds; an agent-first data model must not hide preprocessing cost.

## Component and island decision rule

Apply the same progression in both sibling experiments: static HTML → CSS →
vanilla JS enhancement → a framework island when state/complexity materially
justifies it. Menus, theme switching, tabs, copy buttons, TOCs, simple filtering
and pagination should use vanilla JavaScript; pagination does not use Nift.
Complex configurators, data explorers, dashboards, live tools or stateful workflows
may use React, Vue, Svelte, Solid or another appropriate library if that produces
the clearest, smallest codebase for humans and agents. Do not preselect a framework.

For each island record why vanilla JS was not preferable, chosen runtime, exact
scope, hydration and client bundle cost, state ownership, API boundary and tests.
Keep its ownership local and explicit, with independent tests and an accessible
static shell where practical. One widget does not justify hydrating the entire
site. Both experiments may independently choose the same island technology;
do not force differences simply to make their repositories look different.

## Current status and boundaries

**Planning only. STOP before implementation.** The repositories currently
contain documentation and provenance, not a Nift starter, templates, imported
content, a server, workflows, or a rendered site. No implementation checkpoint
is complete. Resume only after the user reviews these plans and explicitly
approves implementation. This is the user's requested stopping point.

User clarification takes precedence over the original outline:

- The Capgo websites should follow a similar style family to existing Capgo.
  Light/dark choices and blue are allowed. Dark mode/no blue is a rule for
  `lab.nift.dev` / `labs.nift.dev` catalogue and report pages only.
- These projects are **not static-only**. They should be downloadable and useful
  with a user's own APIs/configuration. Nift composes content; ordinary runtime
  tooling may provide application behavior. No Nift/core or unrelated package
  changes are authorised.
- GitHub Pages remains an optional preview for generated content. It cannot host
  server-side API handlers, secrets, authentication callbacks, translation
  middleware, or private service proxies. The full downloadable project may run
  a small local server and deploy on a suitable runtime host.
- Pagination, where needed, uses JavaScript, not Nift pagination.

Read `UPSTREAM.md` and `provenance.json` before this document's gameplan.
The exact pin is shared by both projects; do not refresh one independently.
No permanent upstream fork is necessary. Future comparison patches belong in
`benchmark/patches/` with purpose and digest recorded.

## Shared corpus and acquisition contract

Start from the pinned public checkout and produce one agreed corpus manifest
format, versioned in each experiment. Fields: source path, source hash,
canonical logical route, locale, collection/type, published state, title,
description, expected headings, body-text digest, image/link references,
component requirements, and transformation provenance. Add schema version,
upstream SHA, runtime snapshot digests and explicit exclusion reason records.
Reject duplicate routes and path traversal. Sort by stable route; JSON key/order
and line-ending conventions must be deterministic. Do not duplicate hand-edited
content between representations.

First implementation checkpoints establish the exact inclusion manifest:
English docs, published articles/blog, plugin tutorials, marketing informational
pages, generated indexes and discoverability outputs. Exclude private account
applications and write an honest capability matrix for runtime services.
Use the same document/route inclusion decisions, text/heading checks and public
snapshot data in both experiments. The agent-first version may change presentation/navigation; map
old logical URLs to new ones so coverage and links remain auditable.

Content updates are explicit, never a network fetch during an ordinary build.
A future importer reads a specified SHA, verifies hashes, reports additions,
changes and removals, and writes only its owned files. Local authored overrides
have separate ownership and merge conflicts are reported, never overwritten.
Do not commit upstream `.git`, install trees, secret configuration, or unrelated
worker applications as a substitute for corpus import.

## Downloadable application and optional preview

Plan two explicit modes with the same content:

1. **Frozen preview/benchmark:** deterministic checked snapshots for public
   metrics/pricing content; static search, diagrams and navigation. Clearly label
   snapshot dates and disable or externally link unavailable transactional
   actions. Can be deployed on Pages.
2. **Configured application:** local/hosted runtime adapter + vanilla-first browser
   client (with justified local islands), configured against a user's own APIs. Define capability contracts for
   plans/credits, metrics, forms and supported tools. Support provider URL,
   tenant/public settings, authentication mode and documented response schemas.
   Unknown/unconfigured features give a clear setup/unavailable state. Do not
   assume every user's backend implements Capgo's endpoints.

Proposed `config/public.example.json` contains only safe client configuration;
`.env.example` lists server-side variable names, never values. Private tokens and
service credentials stay server-side. Browser-public settings and responses
need documented CORS/origin/auth behavior. A small adapter under `runtime/`
provides configurable routing/proxy/session hooks when a browser cannot safely
call an API directly. Prefer existing ordinary libraries if authentication needs
them; a dependency budget is not a reason to invent auth. Separate presentation
from service adapters so users can replace a provider without editing templates.
Provide `runtime/README.md`, an API schema/capability matrix, install/run commands,
and contract fixtures. Do not claim forms/register/MCP/UDID work until their
specific supported behavior passes local integration checks.

Make configured live mode optional for benchmarks: network latency, service state
and secrets must not enter page-generation comparisons. Preserve a documented
route from full working functionality to the frozen test mode; never silently
substitute snapshots in a live UI. The ordinary build need not contact APIs.

## Nift conventions and ownership

Proposed future output is `public/`; it is not a separate Git checkout. Keep
one repository with source, reviewed static assets and deployment recipes.
Document which generated files are ignored and reconstructable; preserve static
assets across builds. Nift owns `.nift/config.json` and `.nift/tracked.json`,
`content/` page wrappers, `templates/`, and dependency metadata.

Use `@content` once through each template graph; use `@input` for partials and
`@path` for tracked pages/local assets. Trailing-slash tracked names produce
nested `index.html` outputs. Do not invent tracking fields to carry metadata;
keep page metadata in JSON with documented schemas. Use `@json(name, path)`
for data and automatic dependencies; `@dep` or per-page `.deps.json` for external
compiler/importer inputs inside the project. Avoid global corpus dependencies
on every page if the actual dependency is per-document.

Nift file-form `@markup` evaluates template syntax first. The future importer
must prove that literal `@...`/`$[...]`, braces, code fences and generated HTML
remain text where intended. Test escaping and supported opaque insertion before
scaling up. Plain content processing and MDX compilation have separate caches
keyed by source/tool version/component dependencies. Source edits must invalidate
the converter and Nift page; hashing a cached HTML fragment alone is insufficient.
Benchmark the full conversion orchestration, not just a pre-rendered fragment.

Run `nift build` immediately after changes to config/tracking and after meaningful
edits. Validate `nift status`, `nift build --all`, normal incremental and explicit
`nift build <tracked-name>`. Pin Nift/tool releases after the compatibility spike;
the original planning inspection found Nift 4.5.0; the MDX investigation required
Nift 4.6.0 because 4.5.0 rejected the parser’s UTF-8 encode call. Verify the
certified package/runtime combination before selecting future runners.
See https://nift.dev/docs.html, https://nift.dev/docs/markup.html,
https://nift.dev/docs/paths.html, https://nift.dev/docs/incremental-builds.html,
and https://nift.dev/docs/platforms/github-pages.html.

## Routes and deployment contracts

Use `data/routes.json` as the logical route registry, with original Capgo path,
experiment path, tracked name, output path, type and alias mapping. Preserve
trailing-slash clean URLs where practical. Relative `@path` links keep HTML
usable under `/capgo/` or `/capgo-agent/` on project Pages and at a domain
root. Audit JS fetches, imports, CSS URLs, fonts and dynamically created links
separately; configure a public base URL for canonicals/OG/sitemap/robots. Canonicals
must use the actual deployment and preview indexing policy, not accidentally
claim to be the production Capgo site.

A future Actions workflow builds, audits and uploads only `public/`, then deploys
Pages. Add `.nojekyll`, a useful 404 page and complete nested routes. No workflow
or Pages activation in this planning phase. Validate artifact size and hosting
limits with the real asset inventory; do not assume 1,674 asset files fit all
host limits without measuring bytes. Generate sitemaps from canonical included
routes; aliases go in the redirect manifest, not duplicate canonical sitemap rows.
Static redirects use HTML stubs/visible links; runtime mode may preserve status
codes. Optional runtime host deployment has its own command/environment settings
and is not a GitHub Pages deployment. Test both repository-prefix and root URLs.

## Validation and benchmark acceptance

Corpus gates: exact agreed route coverage; no duplicate logical/output paths;
no missing headings/sections or code blocks; no silent unsupported MDX;
body-text checks that permit deliberate shell/design changes; image/asset closure;
local links and fragments; external-link syntax (live availability separately);
valid title/description/canonical/OG/locale metadata; practical HTML checks.
Carry a classified known-upstream-issues list rather than hide failures.
Accessibility includes keyboard navigation, search, menus, tabs, dialogs, copy
controls, focus, contrast and reduced motion. Responsive checks sample layouts,
not every page/viewport. Application gates verify provider contracts, setup
states, runtime feature success/error paths and browser/server config separation.

Benchmark only after corpus gates pass. Shared baseline: exact upstream SHA,
lock hash, exact installed runtime patches, machine/CPU/RAM/filesystem,
concurrency, environment, public response snapshots and cache definitions.
Measure upstream `bun run build` and isolated docs/web phases. Compare end-to-end
Nift orchestration including conversion/import/render/assets/search/highlighting
against equal declared work. Also report Nift render-only as a separate metric.
Never compare pre-staged Nift assets to full Astro assembly without qualification.

Scenarios: cold/full artifact generation; warm forced full; no-change; one authored
content edit through normal build; explicit target; shared layout/component fan-out.
Record wall time, aggregate process-tree/cgroup peak memory when possible, output
bytes, install/dependency/binary footprint, input and output page counts. Report
runtime-adapter footprint separately and measure API latency only in a separately
controlled application scenario. Same hardware, frozen inputs, declared warmups,
repeat runs and dispersion, raw commands/results. Invalid output fails the gate;
no invented targeted Astro equivalent and no universal speed claim.

## Maintenance/agent comparison contract

Compare upstream / capgo / capgo-agent on equivalent tasks after implementation
and corpus certification. Include adding a docs page, changing global navigation,
updating a shared component, adding a content type, altering a stateful UI feature,
tracing source to output, diagnosing an introduced bug and a cross-cutting visual
change. Freeze task specifications, equivalent correctness tests, model/tool
settings and starting states; reset between runs and document intervention.

Record task success/correctness, agent turns, context/tokens where measurable,
files inspected/modified, failed builds/tests, unnecessary edits and human
intervention. Collect the agent’s architecture explanation and preferred codebase
with reasons. Keep this dimension separate from build/system timing: clean/full,
warm/full, no-change, one content edit, targeted build, shared-layout fanout,
memory, dependency/install footprint and output size. Do not run this evaluation
during planning or infer maintenance superiority from build speed.

## Safety and next action

Do not delete `.git`, wipe existing project trees, rewrite unrelated history,
modify Nift or unrelated packages, or start a benchmark/deployment campaign now.
After approval, execute the checklist in `GAMEPLAN.md` in order, with a small
reviewable commit and evidence note for each checkpoint. Update this handover as
facts change. Mark a checkpoint complete only after its acceptance checks pass.
Until then, stop at these planning documents.

## Rename/planning revision completed

GitHub repository identity and local .git history were preserved in place. The
new canonical repository names and project prefixes are capgo and capgo-agent.
The upstream SHA, lock digest and materially equivalent shared corpus are
unchanged. All implementation checkpoints remain pending; the rename did not
start site or MDX production work. Both plans now include the same island rule
and separate build/system and maintenance/agent evaluation protocols.
