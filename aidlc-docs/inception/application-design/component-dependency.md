# Component Dependencies — AI Architecture Cookbook

## Dependency Matrix

| Component | Depends On | Depended On By |
|-----------|-----------|----------------|
| C1: Cookbook Entries | C3 (Schema) | C2, C4, C5, C6, C7 |
| C2: Index System | C1 (Entries) | C4, C5 |
| C3: Schema System | — (root) | C1, C7 |
| C4: MCP Server | C1, C2 | — (leaf) |
| C5: Skills Package | C1, C2 | — (leaf) |
| C6: Prompt System | C1 | — (leaf) |
| C7: Validation System | C1, C3 | C8 |
| C8: Governance | C7 | — (leaf) |

## Dependency Diagram

```
+------------------+
|   C3: Schema     |  (root — no dependencies)
|  base-template   |
|  + schema.json   |
+--------+---------+
         |
         | conforms to
         v
+------------------+       indexes        +------------------+
|  C1: Cookbook     | ------------------> |   C2: Index      |
|  Entries (33)    |                      |  index.yaml +    |
|  {category}/     |                      |  _index.yaml     |
|  {domain}.yaml   |                      +--------+---------+
+---+---------+----+                               |
    |         |                                    |
    |         |    +-------------------------------+
    |         |    |               |
    |         v    v               v
    |  +------------------+  +------------------+
    |  |  C4: MCP Server  |  |  C5: Skills      |
    |  |  5 tools (TS)    |  |  ai-architecture-cookbook.md        |
    |  +------------------+  +------------------+
    |
    |         validates
    v
+------------------+       +------------------+
|  C7: Validation  | <---- |  C6: Prompt      |
|  schema.json +   |       |  System          |
|  validate.py     |       |  modules/ +      |
+--------+---------+       |  compose.py      |
         |                 +------------------+
         | enforces via CI
         v
+------------------+
|  C8: Governance  |
|  CONTRIBUTING.md |
|  CI workflows    |
+------------------+
```

## Build Order (Dependency-Aware)

Based on dependency analysis, components must be built in this order:

1. **C3: Schema System** — No dependencies. `base-template.yaml` already exists; `schema.json` derived from it.
2. **C1: Cookbook Entries** — Depends on C3. The 33 YAML entries (batches 1-5).
3. **C2: Index System** — Depends on C1. `index.yaml` and `_index.yaml` files generated after entries exist.
4. **C7: Validation System** — Depends on C1 + C3. JSON Schema + semantic validator.
5. **C4: MCP Server** — Depends on C1 + C2. TypeScript server reading YAML files and index.
6. **C5: Skills Package** — Depends on C1 + C2. ai-architecture-cookbook.md referencing entries via index.
7. **C6: Prompt System** — Depends on C1. Module generation from YAML entries + compose tool.
8. **C8: Governance** — Depends on C7. CONTRIBUTING.md, CI workflow using validation.

**Note**: C4, C5, C6 are independent of each other and can be built in parallel once C1 + C2 are complete.

## Cross-Cutting Concerns

| Concern | Addressed By |
|---------|-------------|
| Schema evolution | `meta.schema_version` field + migration notes in base-template.yaml |
| Content versioning | `meta.version` (semver) per entry |
| Discovery | C2 (Index System) — global + per-category |
| Quality enforcement | C7 (Validation) + C8 (Governance CI) |
| Token efficiency | YAML format (AD-01) + structured sections (no prose) |
| Multi-format distribution | C4 (MCP) + C5 (Skills) + C6 (Prompts) — independent channels |
