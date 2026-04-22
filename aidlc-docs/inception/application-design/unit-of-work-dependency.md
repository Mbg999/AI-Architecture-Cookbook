# Unit of Work Dependencies — AI Architecture Cookbook

## Dependency Matrix

| Unit | Depends On | Depended On By |
|------|-----------|----------------|
| U0: Foundation Setup | — (root) | U1, U1-V, U2, U3, U4, U5 |
| U1: Foundational Standards | U0 | U2, U3, U4, U5, U6-I |
| U1-V: Validation Tooling | U0 | U1*, U2, U3, U4, U5, U6-G |
| U2: App Architecture | U0, U1, U1-V | U4, U5, U6-I |
| U3: Infrastructure | U0, U1, U1-V | U5, U6-I |
| U4: Security & Quality | U0, U1, U1-V, U2 | U6-I |
| U5: Integration & Data | U0, U1, U1-V, U3 | U6-I |
| U6-I: Global Index | U1-U5 | U6-D, U6-G |
| U6-D: Distribution | U1-U5, U6-I | U6-G |
| U6-G: Governance | U1-V, U6-I, U6-D | — (leaf) |

*U1-V is built alongside U1 in Batch 1, not strictly before it. Authentication.yaml (from U0) is used to test validation tooling.

## Dependency Diagram

```
U0: Foundation
(base-template + auth)
    |
    +--------------------+
    |                    |
    v                    v
U1: Foundational     U1-V: Validation
(7 YAML entries)     (schema.json + validate.py)
    |                    |
    +------+------+------+
    |      |      |
    v      v      v
   U2     U3     U4
  (App)  (Infra) (Sec)
    |      |      |
    +------+------+------+
    |                    |
    v                    v
   U5                 U6-I
  (Integration)      (index.yaml)
                        |
              +---------+---------+
              |                   |
              v                   v
           U6-D               U6-G
         (Distribution)     (Governance)
```

## Execution Sequence

| Order | Unit(s) | Batch | Can Parallelize? |
|-------|---------|-------|-----------------|
| 1 | U0 | 0 | — (done) |
| 2 | U1 + U1-V | 1 | Yes (U1 and U1-V are co-built) |
| 3 | U2 | 2 | No (needs U1 cross-refs) |
| 4 | U3 | 3 | No (needs U1 cross-refs) |
| 5 | U4 | 4 | No (needs U1+U2 cross-refs) |
| 6 | U5 | 5 | No (needs U1+U3 cross-refs) |
| 7 | U6-I | 6 | No (needs all entries) |
| 8 | U6-D | 6 | After U6-I |
| 9 | U6-G | 6 | After U6-D |

**Note**: U2-U5 are sequential because each batch's cross-references may reference entries from prior batches, and the auto-generate-all model (Q2=C) generates them in order.

## Critical Path

```
U0 → U1/U1-V → U2 → U3 → U4 → U5 → U6-I → U6-D → U6-G
```

All units are on the critical path because content batches are sequential and distribution depends on all content being complete.
