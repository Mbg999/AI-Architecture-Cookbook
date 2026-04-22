# Units of Work — AI Architecture Cookbook

## Unit Decomposition Strategy

**Project type**: Content-generation repository (not traditional software)
**Decomposition basis**: Content batches by priority group + tooling components
**Approval model**: Auto-generate all (Q2=C) — single review at end
**Validation strategy**: Build validation in Batch 1 (Q3=C), validate as we go

---

## Unit Inventory

| Unit ID | Unit Name | Type | Size | Batch |
|---------|-----------|------|------|-------|
| U0 | Foundation Setup | Migration | 2 files | 0 (done) |
| U1 | Foundational Standards | Content | 7 YAML + _index.yaml | 1 |
| U1-V | Validation Tooling | Tooling | schema.json + validate.py | 1 |
| U2 | Application Architecture | Content | 7 YAML + _index.yaml | 2 |
| U3 | Infrastructure & Deployment | Content | 6 YAML + _index.yaml | 3 |
| U4 | Security & Quality | Content | 6 YAML + _index.yaml | 4 |
| U5 | Integration & Data | Content | 6 YAML + _index.yaml | 5 |
| U6-I | Global Index | Content | index.yaml | 6 |
| U6-D | Distribution Packaging | Tooling | MCP server + Skills + Prompts | 6 |
| U6-G | Governance & Docs | Docs | CONTRIBUTING.md + README + CI | 6 |

---

## Unit Details

### U0: Foundation Setup (COMPLETE)

**Status**: Done
**Deliverables**:
- `base-template.yaml` v3 — canonical schema
- `foundational/authentication/authentication.yaml` v2.0.0 — reference entry (moved from root per Q1=A)

---

### U1: Foundational Standards

**Responsibility**: Generate 7 cookbook entries for cross-cutting foundational concerns. Also create the category `_index.yaml`.

**Deliverables**:
- `foundational/_index.yaml` — category metadata
- `foundational/api-design/api-design.yaml`
- `foundational/error-handling/error-handling.yaml`
- `foundational/logging-observability/logging-observability.yaml`
- `foundational/data-persistence/data-persistence.yaml`
- `foundational/input-validation/input-validation.yaml`
- `foundational/messaging-events/messaging-events.yaml`
- `foundational/configuration-management/configuration-management.yaml`

**Quality Gates**: Each entry ≥3 patterns, ≥3 anti-patterns, ≥1 example, ≥4 prompt recipes, validates against schema.json

**Dependencies**: U0 (schema exists), authentication.yaml as reference

---

### U1-V: Validation Tooling

**Responsibility**: Build validation tools early so all subsequent batches can be validated during generation.

**Deliverables**:
- `tools/schema.json` — JSON Schema derived from base-template.yaml v3
- `tools/validate.py` — Schema + semantic validation script

**Quality Gates**: Validates authentication.yaml successfully, catches intentionally broken files

**Dependencies**: U0 (base-template.yaml exists)

---

### U2: Application Architecture Standards

**Responsibility**: Generate 7 cookbook entries for structural and design patterns.

**Deliverables**:
- `application-architecture/_index.yaml`
- `application-architecture/layered-architecture/layered-architecture.yaml`
- `application-architecture/service-architecture/service-architecture.yaml`
- `application-architecture/domain-driven-design/domain-driven-design.yaml`
- `application-architecture/state-management/state-management.yaml`
- `application-architecture/dependency-injection/dependency-injection.yaml`
- `application-architecture/repository-pattern/repository-pattern.yaml`
- `application-architecture/design-patterns/design-patterns.yaml`

**Quality Gates**: Same as U1. Cross-references to foundational entries must resolve.

**Dependencies**: U0 (schema), U1-V (validation), U1 (cross-references to foundational entries)

---

### U3: Infrastructure & Deployment Standards

**Responsibility**: Generate 6 cookbook entries for infrastructure patterns.

**Deliverables**:
- `infrastructure/_index.yaml`
- `infrastructure/containerization/containerization.yaml`
- `infrastructure/orchestration/orchestration.yaml`
- `infrastructure/ci-cd/ci-cd.yaml`
- `infrastructure/infrastructure-as-code/infrastructure-as-code.yaml`
- `infrastructure/cloud-architecture/cloud-architecture.yaml`
- `infrastructure/database-migration/database-migration.yaml`

**Quality Gates**: Same as U1. Cross-references to prior batches resolve.

**Dependencies**: U0, U1-V, U1 (some entries reference foundational patterns)

---

### U4: Security & Quality Standards

**Responsibility**: Generate 6 cookbook entries for security hardening and quality assurance.

**Deliverables**:
- `security-quality/_index.yaml`
- `security-quality/encryption/encryption.yaml`
- `security-quality/rate-limiting/rate-limiting.yaml`
- `security-quality/testing-strategies/testing-strategies.yaml`
- `security-quality/code-quality/code-quality.yaml`
- `security-quality/performance-optimization/performance-optimization.yaml`
- `security-quality/accessibility/accessibility.yaml`

**Quality Gates**: Same as U1. Security entries must have full `security_hardening` sections.

**Dependencies**: U0, U1-V, U1 (authentication cross-refs), U2 (testing references architecture)

---

### U5: Integration & Data Standards

**Responsibility**: Generate 6 cookbook entries for external integrations and data patterns.

**Deliverables**:
- `integration-data/_index.yaml`
- `integration-data/third-party-integration/third-party-integration.yaml`
- `integration-data/webhooks/webhooks.yaml`
- `integration-data/file-storage/file-storage.yaml`
- `integration-data/search/search.yaml`
- `integration-data/data-transformation/data-transformation.yaml`
- `integration-data/versioning/versioning.yaml`

**Quality Gates**: Same as U1.

**Dependencies**: U0, U1-V, U1 (API design cross-refs), U3 (infrastructure cross-refs)

---

### U6-I: Global Index

**Responsibility**: Generate the master `index.yaml` cataloging all 33 entries with tags, categories, and relationships.

**Deliverables**:
- `index.yaml` — Global catalog with tag_index, full entry listings

**Quality Gates**: Every entry on disk appears in index. All tags consistent. validate.py index check passes.

**Dependencies**: U1-U5 (all entries must exist)

---

### U6-D: Distribution Packaging

**Responsibility**: Build MCP server, Skills package, and prompt system.

**Deliverables**:
- `mcp-server/` — TypeScript MCP server with 5 tools
- `skills/SKILL.md` — Mega-skill for AI assistants
- `prompts/modules/*.md` — 33 instruction modules
- `prompts/compose.py` — Composition tool
- `.github/copilot-instructions.md` — Pre-built (generated via compose.py)
- `CLAUDE.md` — Pre-built (generated via compose.py)
- `.cursorrules` — Pre-built (generated via compose.py)

**Quality Gates**: MCP server compiles, compose.py runs, generated instruction files are syntactically valid.

**Dependencies**: U1-U5 (entries), U6-I (index for MCP discovery)

---

### U6-G: Governance & Documentation

**Responsibility**: Community contribution infrastructure.

**Deliverables**:
- `CONTRIBUTING.md` — Contribution guide with template, PR checklist
- `README.md` — Comprehensive project documentation
- `.github/PULL_REQUEST_TEMPLATE.md` — PR template
- `.github/workflows/validate.yml` — CI workflow using validate.py

**Quality Gates**: CI workflow references correct validation script paths. README covers all 4 consumption methods.

**Dependencies**: U1-V (validation tools for CI), U6-I (index for README), U6-D (distribution for README)

---

## Code Organization Strategy (Greenfield)

```
AI-Architecture-Cookbook/               # Workspace root
├── {category}/{domain}/{domain}.yaml   # Content entries
├── {category}/_index.yaml              # Category metadata
├── index.yaml                          # Global index
├── base-template.yaml                  # Schema definition
├── mcp-server/                         # TypeScript MCP server
├── skills/                             # Skills package
├── prompts/                            # Prompt system
├── tools/                              # Validation tooling
├── .github/                            # GitHub integration
└── aidlc-docs/                         # AI-DLC docs (dev only, not distributed)
```

All application content lives at workspace root. `aidlc-docs/` is development documentation only.
