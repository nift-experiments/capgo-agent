# Frozen Agent repeated benchmarks — Checkpoint F

Measured revision `6371356` includes the post-freeze incremental-dependency correctness fix. Architecture otherwise remains `fbc7bb5`. All native entry controllers are compiled by the normal pre-build hook on every invocation. Converted HTML remains converted; no MDX conversion or MDX cache applies.

| Workload | Runs | Median | Range | Maximum process RSS |
|---|---:|---:|---:|---:|
| blog | 3 | 1.04s | 1.02–1.07s | 101.0 MiB |
| docs | 3 | 1.08s | 1.08–1.12s | 101.3 MiB |
| full | 3 | 2.23s | 2.21–2.34s | 101.7 MiB |
| marketing | 3 | 1.09s | 1.05–1.09s | 101.5 MiB |
| noop | 3 | 1.08s | 1.08–1.11s | 101.8 MiB |
| rich | 3 | 1.06s | 1.05–1.06s | 101.2 MiB |

Full is ordinary `nift build --all`; all other cases use ordinary `nift build`. Each edit changes visible text in a maintained HTML fragment and asserts that text reaches its actual output route. Sources and outputs are restored after each sample. Warm output/assets/hash state, installed dependencies and OS page cache remain; an unmeasured full prime precedes measurements. Installation and restoration are excluded. No targeted build or benchmark-specific caching is used. Measurements run sequentially without another build/parity process.

GNU `/usr/bin/time -v` records maximum process RSS, not aggregate concurrent memory. Hardware: Intel i7-12700H / 20 logical CPUs, Ubuntu 26.04.1 / Linux 7.0.0-29, Node 22.22.1, Nift 4.6.0, threads `-1`. Installed Nift does not expose its source revision; exact SHA-256 `03ed5ed8344280c736e78a18f4ad80c6e92e3f45e63ff3784523aa122f0ac0b6` identifies the executable. Dependency pins, lock hash, exact commands, CPU details and raw logs/timing records are in `evidence/final-benchmarks`.

The initial real-edit attempt was rejected because the raw-fragment read had no explicit dependency and Nift skipped the edit. Every route now declares fragment/shared-shell dependencies. Those rejected samples are not the final dataset. The historical five-controller 1.98s sample is superseded, not presented as a median. No architecture performance tuning followed these results.
