# Agent architecture freeze — Checkpoint E

Architecture is frozen at source checkpoint `fbc7bb5021097631eb43a6ca4b56ac96a348210f`, after controller recovery, representative interaction verification, native-code audit and successful fresh-checkout reproduction. Documentation/evidence commits may follow without changing that architecture.

This freezes the bounded experiment frontend and compatible-provider adapter. The production limitations in `INTERACTION-MATRIX.md` and `NATIVE-ARCHITECTURE.md` remain part of the result, including unverified authenticated/device/signing success. “Frozen” does not claim those services have been recreated or all production workflows certified.

After this checkpoint permit only correctness, reproducibility and benchmark-methodology fixes. Do not adjust the architecture in response to benchmark results. A further optimization phase requires a separate explicit decision.

Faithful Capgo remains fixed at `590c1eec`. Its recorded warm/full median is 5.67s / 235.8 MiB; upstream's median is 106.09s / 3.61 GiB. Their workload/cache caveats remain unchanged. The five-controller single Agent 1.98s sample is historical and must not substitute for repeated frozen-architecture measurements.

Post-freeze correctness correction: real-edit verification caught raw `open()` reads missing explicit Nift dependencies. Every wrapper now declares its raw fragments and shared docs shells with `@dep`; this preserves rendered bytes and makes ordinary incremental builds propagate edits. The final measurements use the corrected revision, not the invalid skipped-edit sample. `tools/check-fragment-dependencies.py` guards these declarations.
