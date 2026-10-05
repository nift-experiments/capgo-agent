# Native controller checkpoint

Five production module assets are rebuilt from maintained vanilla JavaScript with pinned esbuild, without an Astro/framework compiler. All HTML remains byte identical. Full 1,347-route / 3,876-file DOM/link parity passes with zero introduced issues. Validation permits only the explicit manifest asset replacements, and verifies their bytes against freshly generated source output.

Browser: plugin search `zz-no-plugin` gives 0/154; clearing and selecting Updates gives 6/154, matching the faithful oracle. Homepage canvas initializes at 1180x600.53125, creates exactly one map glow, and logs no errors at initial observation. These bounded checks do not certify all pointer animations, viewport classes, API outcomes or the other rebuilt controllers. Screenshots and accessibility evidence are retained here.

First two-controller wrapper build: 6.42s / 150312 KiB maximum RSS, including oracle/asset/output verification; this is not the direct Nift page-build time or a repeated final benchmark. Three additional controller recoveries and the direct Nift prebuild hook were added subsequently. Final Agent benchmark campaign remains outstanding.

A serialized corruption check replaced the plugin output with invalid content, confirmed that the validator rejected it, then restored the original bytes. Generated Nift state (2,698 hashes/lock files) is removed from tracking; local caches remain. Rooted `/build/` ignores preserve the CLI build-reference route previously hidden by the broad ignore.

Additional checks: CLI Upload switches the demo command to `bundle upload`; native-build Cursor selection shows exactly its config panel and `--client cursor`. No backend build or device identification was requested. Independent clone output parity passes all 1,347 routes / 3,876 files with five source-verified controller replacements, zero DOM differences and zero introduced issues. See `docs/CLEAN-CHECKOUT.md`.
