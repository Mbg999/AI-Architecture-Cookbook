# Application Design — AI Architecture Cookbook

## Overview

The AI Architecture Cookbook is a knowledge repository of 33 architectural standards, distributed through 4 channels (MCP server, Skills, prompt files, raw repo) for consumption by AI code assistants. This document consolidates the architectural design.

---

## Repository Structure

```
AI-Architecture-Cookbook/
├── index.yaml                              # Global index — master catalog
├── base-template.yaml                      # v3 schema definition
│
├── foundational/                           # Category: Foundational (7 entries)
│   ├── _index.yaml                         # Category metadata
│   ├── authentication/
│   │   └── authentication.yaml
│   ├── api-design/
│   │   └── api-design.yaml
│   ├── error-handling/
│   │   └── error-handling.yaml
│   ├── logging-observability/
│   │   └── logging-observability.yaml
│   ├── data-persistence/
│   │   └── data-persistence.yaml
│   ├── input-validation/
│   │   └── input-validation.yaml
│   ├── messaging-events/
│   │   └── messaging-events.yaml
│   └── configuration-management/
│       └── configuration-management.yaml
│
├── application-architecture/               # Category: Application Architecture (7 entries)
│   ├── _index.yaml
│   ├── layered-architecture/
│   │   └── layered-architecture.yaml
│   ├── service-architecture/
│   │   └── service-architecture.yaml
│   ├── domain-driven-design/
│   │   └── domain-driven-design.yaml
│   ├── state-management/
│   │   └── state-management.yaml
│   ├── dependency-injection/
│   │   └── dependency-injection.yaml
│   ├── repository-pattern/
│   │   └── repository-pattern.yaml
│   └── design-patterns/
│       └── design-patterns.yaml
│
├── infrastructure/                         # Category: Infrastructure (6 entries)
│   ├── _index.yaml
│   ├── containerization/
│   │   └── containerization.yaml
│   ├── orchestration/
│   │   └── orchestration.yaml
│   ├── ci-cd/
│   │   └── ci-cd.yaml
│   ├── infrastructure-as-code/
│   │   └── infrastructure-as-code.yaml
│   ├── cloud-architecture/
│   │   └── cloud-architecture.yaml
│   └── database-migration/
│       └── database-migration.yaml
│
├── security-quality/                       # Category: Security & Quality (6 entries)
│   ├── _index.yaml
│   ├── encryption/
│   │   └── encryption.yaml
│   ├── rate-limiting/
│   │   └── rate-limiting.yaml
│   ├── testing-strategies/
│   │   └── testing-strategies.yaml
│   ├── code-quality/
│   │   └── code-quality.yaml
│   ├── performance-optimization/
│   │   └── performance-optimization.yaml
│   └── accessibility/
│       └── accessibility.yaml
│
├── integration-data/                       # Category: Integration & Data (6 entries)
│   ├── _index.yaml
│   ├── third-party-integration/
│   │   └── third-party-integration.yaml
│   ├── webhooks/
│   │   └── webhooks.yaml
│   ├── file-storage/
│   │   └── file-storage.yaml
│   ├── search/
│   │   └── search.yaml
│   ├── data-transformation/
│   │   └── data-transformation.yaml
│   └── versioning/
│       └── versioning.yaml
│
├── skills/                                 # Distribution: Skills package
│   └── ai-architecture-cookbook.md                            # Mega-skill for AI assistants
│
├── mcp-server/                             # Distribution: MCP server
│   ├── src/
│   │   ├── server.ts                       # MCP server entry point
│   │   ├── tools/
│   │   │   ├── query-standard.ts
│   │   │   ├── search-standards.ts
│   │   │   ├── get-checklist.ts
│   │   │   ├── get-decision-tree.ts
│   │   │   └── recommend-pattern.ts
│   │   ├── loader.ts                       # YAML file loader + index reader
│   │   └── evaluator.ts                    # Decision tree evaluation engine
│   ├── package.json
│   └── tsconfig.json
│
├── prompts/                                # Distribution: Prompt file system
│   ├── modules/                            # Per-standard instruction modules
│   │   ├── authentication.md
│   │   ├── api-design.md
│   │   └── ... (33 module files)
│   └── compose.py                          # Generator: build instruction files
│
├── tools/                                  # Validation tooling
│   ├── schema.json                         # JSON Schema for v3
│   └── validate.py                         # Schema + semantic validation
│
├── .github/
│   ├── copilot-instructions.md             # Pre-built (generated)
│   ├── PULL_REQUEST_TEMPLATE.md            # PR checklist template
│   └── workflows/
│       └── validate.yml                    # CI: validation on every PR
│
├── CLAUDE.md                               # Pre-built (generated)
├── .cursorrules                            # Pre-built (generated)
├── CONTRIBUTING.md                         # Contribution guide
├── README.md                               # Project documentation
├── LICENSE                                 # MIT
└── aidlc-docs/                             # AI-DLC documentation (dev only)
```

---

## Design Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Directory structure | Category grouping + `_index.yaml` (Q1=D) | Hierarchical discovery optimal for AI assistants; `_index.yaml` enables metadata-only loading |
| Cross-references | Global `index.yaml` (Q2=B) | Single authoritative source for all relationships; AI loads index first for efficient navigation |
| MCP tools | Comprehensive with `recommend_pattern` (Q3=C) | Maximum utility — AI can get recommendations without manually evaluating decision trees |
| Skills model | Single mega-skill (Q4=A) | Avoids fragmentation; one skill provides router to all 33 standards |
| Prompt files | Modular modules + composition tool (Q5=D) | Users select which standards to include; tool generates format-specific files |
| Validation | JSON Schema + semantic script (Q6=D) | Dual validation catches structural and semantic errors |

---

## AI Consumption Patterns

### Pattern 1: MCP Server (Richest Experience)

```
AI Assistant                         MCP Server
    |                                    |
    |-- search_standards(tags=["api"]) ->|
    |<- [{domain: "api-design", ...}] ---|
    |                                    |
    |-- recommend_pattern({              |
    |     client_types: "web+mobile",    |
    |     data_complexity: "high"        |
    |   }) --------------------------->  |
    |<- [{pattern: "graphql_api",        |
    |     confidence: "high", ...}] -----|
    |                                    |
    |-- get_checklist("api-design") ---> |
    |<- [{id: "CHK-01", ...}] ----------|
```

### Pattern 2: Skills Loading

```
AI Assistant
    |
    |-- Load skills/ai-architecture-cookbook.md
    |   (reads cookbook overview, domain list, instructions)
    |
    |-- User asks about authentication
    |   ai-architecture-cookbook.md says: "Load foundational/authentication/authentication.yaml"
    |
    |-- Read foundational/authentication/authentication.yaml
    |   (full entry with decision tree, patterns, checklist, etc.)
```

### Pattern 3: Instruction Files

```
Developer                             AI Assistant
    |                                      |
    |-- Has .github/copilot-instructions.md in repo
    |   (pre-built with compose.py --standards all)
    |                                      |
    |-- "Build me an API endpoint" ------->|
    |                                      |
    |   AI reads copilot-instructions.md   |
    |   (contains condensed API design,    |
    |    error handling, input validation   |
    |    guidance from cookbook)             |
    |                                      |
    |<- Code following cookbook standards --|
```

### Pattern 4: Raw Repository

```
AI Assistant (with repo access)
    |
    |-- Read index.yaml (discover all entries)
    |-- Read foundational/_index.yaml (category detail)
    |-- Read specific entry YAML as needed
```

---

## Key Architectural Characteristics

| Characteristic | Design Choice |
|---------------|---------------|
| **Modularity** | Each entry is self-contained; distribution channels are independent |
| **Token efficiency** | YAML structured data, no prose; index system prevents loading all 33 entries |
| **Extensibility** | New entries follow base-template.yaml v3; new categories just need `_index.yaml` |
| **Consistency** | Single schema (v3) enforced by dual validation (JSON Schema + semantic) |
| **Multi-channel** | 4 independent distribution channels (MCP, Skills, Prompts, Raw) from same source |
| **Opinionated** | Every decision tree has a fallback; every entry has strong defaults |

---

## Extension Compliance

### Security Baseline
- **Applicable**: Partially — MCP server must validate inputs, prompt composition must sanitize content
- **Addressed**: MCP server tool input validation (type checking, enum constraints); compose.py sanitizes module content during concatenation
- **N/A**: Transport security, encryption at rest, access control (knowledge repo, not a deployed service)

### Property-Based Testing
- **Applicable**: Yes — validation system can use property-based testing
- **Addressed**: `tools/validate.py` semantic checks are property-based by nature (∀ entries: cross-refs resolve, ∀ entries: ≥3 patterns, etc.)
- **N/A**: MCP server PBT (deferred to Build and Test stage)

---

## Related Artifacts

- [components.md](components.md) — Full component inventory (C1-C8)
- [component-methods.md](component-methods.md) — Tool signatures, data structures, CLI interfaces
- [services.md](services.md) — Logical service map (S1-S6)
- [component-dependency.md](component-dependency.md) — Dependency matrix, build order, diagram
