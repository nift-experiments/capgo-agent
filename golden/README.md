# Immutable Capgo production reference

Full successful production build of pinned upstream 7d5b69d6ba8a6630384dffc7d012431ee3ed22ec. All output files are retained byte-for-byte. files.json records the SHA-256 of each file. Ordinary builds must never regenerate or modify golden/site. Intentional regeneration requires a separate reviewed freeze.

The upstream has separate docs and web output directories. site merges them with web precedence for overlapping root files, matching the canonical web root and docs path namespace. collisions.json records every differing overlap; original per-app hashes are retained there.

Build replay: use Node 24.21.0 and Bun 1.4.2, frozen Bun lock, and NODE_OPTIONS with --import pointing to snapshot-fetch.mjs. Run bun run build in the detached pinned upstream checkout. The Kotlin endpoint returns its recorded 404; no data was invented. External optional fetches may still follow upstream fallback behavior. Build metadata and measured time are in build.json.

Original per-app inventories are in per-app-files.json. The four docs files shadowed at the combined root are retained verbatim in overlaps/docs, so both original application outputs can be reconstructed exactly. Server worker artifacts are retained as build evidence; they must not be advertised as static browser assets.
