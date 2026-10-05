# Agent final clean reproduction — Checkpoint D

Architecture revision `fbc7bb5021097631eb43a6ca4b56ac96a348210f` passed in a fresh shallow clone with no copied dependencies, output, Nift hash state or generated controller records. Dependency installation used the lockfile and an already-populated npm download cache (`npm ci --ignore-scripts --offline`); cache-free here describes project/build state, not the machine's package-download cache. The documented online install is below.

Node.js 22.22.1 and installed Nift 4.6.0 were used, with build threads `-1`. No global module lookup, sibling project, upstream checkout or machine-specific source path was required. `NODE_PATH` was removed for preparation. First wrapper preparation/build took **5.07s / 165.4 MiB**, a single bootstrap observation excluding installation. Raw logs are in `evidence/clean-checkout-final`.

```sh
npm ci --ignore-scripts --no-audit --no-fund
node tools/build.mjs --all
nift build --all
node tools/parity.mjs
npm run audit
npm test
npm run preview
```

Nift must be on PATH. The wrapper additionally accepts `NIFT` to select an executable. `.npmrc` selects the public JSR npm bridge required by the pinned @std/semver alias. The first wrapper initializes retained styles/assets and configuration, independently compiles browser controllers, then invokes Nift. Subsequent ordinary Nift builds run the native pre-build hook automatically.

All 1,347 routes pass; 21 replacement entries and 133 generated browser assets match freshly built sources. The 103 retired reference JS files are absent. The audit covers 7,873 distinct referenced includes and four tracked Nift source/config files, with zero issues. Git status stayed clean after builds, parity and tests. Hashes/locks and the generated output inventory remain ignored/reproducible. Historical `migration/structure.json` is extraction history, not the authoritative dependency graph.

Serving was checked from the clean checkout on local port 4178: rich docs render, including the recovered browser modules. Normal preview is http://127.0.0.1:4173/; set `PORT` to override. See `NATIVE-ARCHITECTURE.md` for own-provider setup. Clean reproduction does not certify private account creation, signing/device services, every language or external provider availability.
