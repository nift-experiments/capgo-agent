# Agent clean checkout

Revision `13d2a55` built in an independent local clone with no copied dependencies, generated state, or output. Locked dependency installation is excluded from the 6.26s / 157.9 MiB first-build observation. Node 22.22.1, Nift 4.6.0, build threads -1; no MDX preparation or global package resolution is used. Raw results: `evidence/clean-checkout-native/`.

```sh
npm ci --ignore-scripts --no-audit --no-fund
node tools/build.mjs --all
node tools/parity.mjs
git ls-files -z | node tools/audit-tracked-inputs.mjs --stdin
node runtime/server.mjs
```

The first wrapper build initializes reference assets, then invokes Nift. Subsequent `nift build` or `nift build --all` prepares maintained vanilla controllers and renders maintained HTML. Nift output hashes/locks are ignored and reproducible. All 1,347 wrappers and 7,873 distinct directly referenced includes are tracked; zero audit issues. The historical `migration/structure.json` records extraction history, not the current include dependency graph.

Five native-controller asset differences are allowed only when bytes match freshly bundled maintained source. HTML, other assets, routes, DOM and introduced link defects remain gated against the immutable oracle. APIs/signing/private backend and remaining controller recovery are not certified by this clean-build result.

Local preview is http://127.0.0.1:4173/. `PORT` overrides it. The static browser verification preview additionally runs on port 4177 in this session.
