I’d reset Codex around the built site as the source of truth and make parity the gating condition before any cleanup or “improvement.”

We need to change direction on the Capgo work.

The current reconstruction is not close enough to the real site when served locally. Stop treating the existing source tree/screenshots as something to approximately recreate from scratch.

Instead, use the existing Capgo website’s own successful production build as the canonical reference and work backwards from that into proper Nift projects.

There are still TWO projects:

1. `capgo`
   - faithful migration of the existing Capgo site into Nift;
   - preserve the existing content/MDX authoring model where practical;
   - use the Nift `mdx -> html` package for MDX content;
   - preserve existing frontend behaviour/assets where that is the most faithful migration path.

2. `capgo-agent`
   - agent-oriented Nift reconstruction;
   - same routes, content and visual/behavioural target;
   - use vanilla HTML/CSS/JS wherever practical;
   - use framework/reactive islands only where genuinely justified by shared state or sufficiently complex interaction;
   - do not blindly carry over framework-generated JS from the original site.

Do NOT make changes to Nift itself while doing this work. If a Nift issue is discovered, document it separately and work around it where reasonably possible.

Do NOT delete, replace, recreate, or otherwise damage any existing `.git` history. Use commits normally and preserve all repositories.

## Phase 0 — preserve current work and establish baseline

Before replacing anything:

- inspect the current state of both Capgo repos;
- commit any useful uncommitted investigation/work so nothing potentially valuable is lost;
- document briefly why the previous reconstruction approach is being superseded;
- identify the exact upstream Capgo source revision currently being used;
- build the upstream site successfully using its normal production build process;
- record:
  - upstream commit SHA;
  - build command;
  - runtime/tool versions;
  - total build time;
  - output directory;
  - route count;
  - total output size.

Commit this checkpoint.

## Phase 1 — create a golden production-build snapshot

Treat the existing Capgo production build output as the visual and behavioural oracle.

Capture/index the complete built output:

- HTML pages;
- CSS;
- JS;
- fonts;
- images;
- icons;
- SVGs;
- manifests;
- metadata;
- redirects where visible in build configuration;
- static downloadable files;
- any generated route data.

Produce machine-readable inventories for:

- routes;
- generated files;
- asset hashes;
- HTML page titles;
- canonical URLs;
- meta descriptions;
- heading hierarchy if practical;
- script/style references.

Keep this original build immutable as a golden reference.

Do NOT manually “clean it up” yet.

Commit this checkpoint.

## Phase 2 — make the golden build locally reproducible

Serve the upstream production build locally and verify that what we are comparing against actually looks and behaves like the current Capgo site.

Test a representative route matrix including at least:

- homepage;
- docs landing page;
- several nested docs pages;
- blog/listing page if present;
- individual article/blog page;
- pricing/product pages;
- pages with rich MDX;
- pages with code examples;
- forms/interactions;
- mobile navigation;
- any search UI;
- any unusual dynamic/client-side behaviour.

Capture reference screenshots at multiple viewport sizes.

At minimum use something like:

- ~375px mobile;
- ~768px tablet;
- ~1440px desktop.

These screenshots become golden references.

Commit this checkpoint.

## Phase 3 — bootstrap `capgo` directly from the working built site

For `capgo`, first achieve parity in the least ambitious way possible.

Turn the known-good built output into a Nift-served project without trying to rewrite everything immediately.

The first success criterion is:

> Nift produces/serves an output that is effectively indistinguishable from the upstream production build.

It is acceptable initially to preserve:

- existing compiled CSS;
- existing JS bundles;
- asset structure;
- generated markup.

Do NOT spend this checkpoint making it elegant.

Verify:

- all routes resolve;
- all assets load;
- links work;
- fonts match;
- layout matches;
- responsive behaviour matches;
- interactive behaviour matches.

Compare generated output against the golden build.

Commit once the Nift-produced version reaches this baseline.

## Phase 4 — establish automated parity checks

Before substantial refactoring, create repeatable validation tooling.

At minimum compare:

### Route parity
Every expected upstream route should exist in the Nift build.

### Static asset parity
No accidental missing fonts/images/CSS/JS/assets.

### HTML/content parity
Check relevant semantic content such as:

- titles;
- headings;
- text bodies;
- metadata;
- links;
- image URLs/alt text.

Ignore known nondeterministic/generated differences where appropriate.

### Visual parity
Perform screenshot comparisons against the golden reference across representative routes/viewports.

Classify differences instead of merely reporting a similarity percentage.

Use sensible categories such as:

- exact / effectively exact;
- tiny antialiasing/rendering difference;
- small acceptable layout variance;
- real visual regression;
- missing content;
- broken behaviour.

The gate for continuing should be very high parity, not “roughly similar”.

Commit the parity harness and results.

## Phase 5 — recover proper Nift structure in `capgo`

Once the raw migration is faithful, progressively turn it into a real maintainable Nift project.

Identify repeated generated HTML structures such as:

- `<head>`;
- global navigation;
- announcement bars;
- footer;
- docs shell;
- sidebar;
- breadcrumbs;
- article wrapper;
- blog wrapper;
- CTA sections;
- shared metadata.

Extract these into Nift templates/includes/layouts incrementally.

After EACH meaningful extraction:

- rebuild;
- run route parity;
- run content parity;
- run visual parity.

Do not accept refactors that materially reduce fidelity.

Avoid arbitrary redesign or stylistic cleanup.

Commit logical extractions separately.

## Phase 6 — restore the real MDX/content pipeline in `capgo`

The final `capgo` project must not simply consist of thousands of copied generated HTML pages.

Reconnect the original Capgo content corpus.

Investigate how the upstream project maps:

- MDX files;
- Markdown;
- frontmatter;
- page metadata;
- imports/includes;
- local assets;
- custom MDX components;
- route paths.

Use the Nift MDX package for MDX -> HTML.

The existing `nift-packages/mdx` investigation should be treated as prior work, not restarted from scratch.

Create an adapter layer where necessary for upstream MDX constructs.

Important:

- preserve original content files where possible;
- do not manually rewrite hundreds/thousands of pages merely to make the migration easier;
- preserve content ordering and metadata;
- preserve route URLs.

Where custom framework-specific MDX components exist:

1. inventory them;
2. group them by frequency and complexity;
3. implement deterministic Nift-compatible equivalents;
4. test each against representative upstream pages.

Maintain a report of unsupported/translated constructs.

Commit at sensible component/content milestones.

## Phase 7 — eliminate unnecessary generated-page copying from `capgo`

Now that content is flowing through Nift/MDX:

- remove copied generated HTML page bodies that are no longer required;
- keep production assets/bundles only where they are intentionally still part of the faithful migration;
- preserve exact behaviour where practical;
- avoid replacing stable working frontend functionality purely for aesthetic architectural reasons.

The result should now genuinely be a Nift project rather than an archived built website wrapped in Nift.

Run the full parity suite after every major removal.

Commit this checkpoint.

## Phase 8 — restart `capgo-agent` from the same golden reference

Do NOT base `capgo-agent` on the mediocre current recreation.

Use the same upstream production build, route inventory, content inventory and screenshot corpus as the specification.

The target is:

> same Capgo site, but reconstructed in a lean Nift-native/vanilla implementation suitable for agent maintenance.

Do not blindly copy the upstream framework runtime.

Reuse source content where practical, but build presentation using:

- Nift templates/layouts;
- semantic HTML;
- CSS;
- vanilla JS.

Framework/reactive islands are permitted only when there is a clear reason.

Document any island with:

- what interaction requires it;
- why vanilla JS is insufficient or materially worse;
- what state it owns;
- bundle/runtime cost.

Default assumption: no island is necessary.

Commit initial skeleton once routing/content structure exists.

## Phase 9 — reconstruct visual system for `capgo-agent`

Rather than eyeballing the site, derive the visual system from the golden build.

Inspect actual computed/generated styles and infer:

- type scale;
- font families/weights;
- spacing scale;
- container widths;
- breakpoints;
- colours;
- borders;
- shadows;
- radii;
- header/sidebar geometry;
- mobile behaviour.

Implement those deliberately in clean CSS.

Do not “improve” or reinterpret the design.

The production site is the target.

Implement one major shell at a time:

1. global shell;
2. homepage;
3. docs shell;
4. docs article pages;
5. marketing/product pages;
6. blog/content listings;
7. article pages;
8. remaining special pages.

Run visual parity after each stage.

Commit each meaningful stage.

## Phase 10 — implement behaviour in `capgo-agent`

Inventory actual client-side behaviours from the golden site.

Examples may include:

- responsive navigation;
- sidebar expand/collapse;
- code copy buttons;
- tabs;
- accordions;
- search;
- theme handling;
- forms;
- modals;
- dropdowns;
- table-of-contents tracking;
- scrolling behaviour.

Implement each in the simplest reliable form.

Prefer progressively enhanced vanilla JS.

Do not reproduce framework internals for their own sake.

Commit behaviour groups separately.

## Phase 11 — corpus-wide parity audit

For BOTH projects run a complete audit.

Check every route for:

- HTTP/file existence;
- correct title;
- correct content;
- correct internal links;
- missing images/assets;
- broken anchors;
- duplicate/incorrect canonical metadata;
- incorrect MDX rendering;
- missing component output.

Perform visual testing across a broad representative route matrix.

If feasible, expand screenshot validation to every materially distinct template/page type rather than just a tiny sample.

Produce a clear residual-differences report.

No vague language such as “looks close”.

For every remaining difference classify it as:

- bug to fix;
- deliberate migration difference;
- upstream dynamic/network-dependent behaviour;
- browser rendering variance;
- blocked by a documented technical limitation.

Fix genuine bugs before proceeding.

Commit the audit and fixes.

## Phase 12 — performance benchmarks

Once parity is strong, benchmark:

### Upstream Capgo
- clean/full build;
- rebuild/incremental build if supported;
- cold/warm where sensible;
- peak memory;
- output size;
- dependency installation footprint;
- `node_modules` size;
- dependency count.

### `capgo`
- full Nift build;
- incremental one-page edit;
- targeted `nift build <page>` where applicable;
- peak memory;
- output size;
- dependency/package footprint.

### `capgo-agent`
Same measurements as `capgo`.

For single-page work, explicitly benchmark the most favourable legitimate targeted Nift workflow instead of only whole-project rebuilds.

Repeat measurements enough times to avoid reporting one noisy run.

Record hardware/OS/tool versions.

Do not cherry-pick results.

Commit benchmark tooling and raw results.

## Phase 13 — maintainability/complexity comparison

Compare all three implementations quantitatively where possible.

Record:

- source file count;
- source LOC;
- generated output size;
- JS shipped to browser;
- CSS size;
- package dependency count;
- installation footprint;
- build configuration complexity;
- number of custom adapters/components;
- number of client-side framework components/islands;
- number of content files changed during migration;
- route count.

Also discuss qualitatively:

- how difficult it is for an agent to add a page;
- change global layout;
- modify docs navigation;
- alter shared styling;
- add an interactive component;
- debug a broken route;
- understand the content pipeline.

Do not assume Nift wins. Report what the evidence shows.

Commit this analysis.

## Phase 14 — production-readiness pass

For both Nift projects run:

- broken-link checks;
- accessibility checks where practical;
- HTML validation where practical;
- console-error checks;
- missing-resource checks;
- responsive checks;
- metadata/SEO checks;
- build reproducibility checks;
- clean checkout -> build verification.

Verify no accidental dependence exists on developer-machine-only files.

Commit all fixes.

## Phase 15 — final report

Produce a comprehensive final report covering:

### Upstream
- exact version/revision tested;
- architecture;
- build process.

### `capgo`
- migration architecture;
- how MDX integration works;
- what original runtime/assets were retained;
- fidelity achieved;
- remaining differences.

### `capgo-agent`
- architecture;
- vanilla JS vs islands;
- fidelity achieved;
- remaining differences.

### Comparative results
- build performance;
- incremental/targeted performance;
- memory;
- dependency footprint;
- browser JS;
- source complexity;
- maintenance experience;
- agent-friendliness.

### Conclusion
Answer separately:

1. Is Nift a practical way to migrate the existing Capgo site while retaining its content model?
2. Can an agent reconstruct the same site more simply using Nift + vanilla web technologies?
3. Which implementation would we actually recommend maintaining?
4. What does Nift do better?
5. What does the upstream stack do better?
6. What work remains before either Nift version should replace production?

Be evidence-driven.

## Important constraints

Throughout all phases:

- Do not modify Nift itself.
- Do not modify unrelated Nift packages.
- Do not damage or delete Git repositories/history.
- Do not use destructive repository cleanup.
- Commit at the end of every checkpoint.
- Keep handover/progress documentation current.
- Preserve the upstream build as a permanent golden reference.
- Do not accept “roughly similar” visual fidelity.
- Do not redesign Capgo.
- Do not replace content unnecessarily.
- Do not turn `capgo` into merely copied generated HTML.
- Do not turn `capgo-agent` into another framework-heavy clone.
- Prefer measurements and automated comparisons over subjective claims.

The immediate priority is NOT benchmarking.

The immediate priority is to stop the visual drift, establish the real production build as the oracle, and get both Nift versions measurably faithful to it.

Proceed through the checkpoints sequentially without stopping for confirmation unless there is a genuine destructive/irreversible decision or required information is completely unavailable.

I’d have Codex effectively treat the current version as a failed prototype rather than trying to polish it into parity. The particularly important change is **golden built output first, automated parity second, refactor third**.