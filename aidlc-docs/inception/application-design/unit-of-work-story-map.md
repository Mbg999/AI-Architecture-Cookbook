# Unit of Work — Requirements Map

## Overview
No user stories were generated (skipped — knowledge repository with no user-facing app). This document maps functional and non-functional requirements to units of work.

---

## Functional Requirements Mapping

| Requirement | Description | Units |
|-------------|-------------|-------|
| FR-01 | Cookbook Entry Format (YAML, base-template.yaml schema) | U0, U1-U5 |
| FR-02 | Comprehensive Standard Coverage (decision trees, patterns, anti-patterns, checklists, prompt recipes) | U1-U5 |
| FR-03 | Strongly Opinionated Defaults (fallback, confidence, risk_if_wrong) | U1-U5 |
| FR-04 | Technology-Agnostic Content | U1-U5 |
| FR-05 | Domain Coverage (33 entries across 5 categories) | U1-U5 |
| FR-06 | Build Priority Order | U1→U2→U3→U4→U5 (execution sequence) |
| FR-07 | Conflicting Standards Resolution (cross-reference decision trees) | U1-U5 (via related_standards), U6-I (global index) |

## Non-Functional Requirements Mapping

| Requirement | Description | Units |
|-------------|-------------|-------|
| NFR-01 | AI-First Optimization (YAML, consistent schema, predictable fields) | U0 (schema), U1-U5 (entries), U1-V (validation enforces) |
| NFR-02 | Multi-Format Distribution (Skills, MCP, prompt files, raw repo) | U6-D (all distribution channels) |
| NFR-03 | Community Governance (CONTRIBUTING.md, PR review, validation) | U6-G (governance), U1-V (validation for CI) |
| NFR-04 | Maintainability (self-contained entries, versioning) | U0 (schema versioning), U1-U5 (per-entry versioning) |
| NFR-05 | Scalability (30+ entries, clear organization) | U6-I (index for discovery), category _index.yaml (per U1-U5) |

## Architectural Decisions Mapping

| Decision | Description | Units |
|----------|-------------|-------|
| AD-01 | YAML as Canonical Format | U0 (base-template), U1-U5 (all entries) |
| AD-02 | One File Per Standard | U1-U5 (directory structure) |
| AD-03 | Strongly Opinionated with Escape Hatches | U1-U5 (decision trees with fallbacks) |

---

## Coverage Verification

### All Requirements Covered?

| Requirement | Covered By | Status |
|-------------|-----------|--------|
| FR-01 | U0 + U1-U5 | ✅ |
| FR-02 | U1-U5 (quality gates enforce) | ✅ |
| FR-03 | U1-U5 (decision_metadata required) | ✅ |
| FR-04 | U1-U5 (content guidelines) | ✅ |
| FR-05 | U1-U5 (33 entries) | ✅ |
| FR-06 | Execution sequence U1→U5 | ✅ |
| FR-07 | U1-U5 (related_standards) + U6-I (index) | ✅ |
| NFR-01 | U0 + U1-V | ✅ |
| NFR-02 | U6-D | ✅ |
| NFR-03 | U6-G + U1-V | ✅ |
| NFR-04 | U0 meta.version + per-entry | ✅ |
| NFR-05 | U6-I + _index.yaml | ✅ |
| AD-01 | U0 | ✅ |
| AD-02 | U1-U5 structure | ✅ |
| AD-03 | U1-U5 decision trees | ✅ |

**Result**: All 15 requirements and decisions are mapped to at least one unit. No gaps.

### All Units Have Requirements?

| Unit | Requirements | Status |
|------|-------------|--------|
| U0 | FR-01, NFR-01, NFR-04, AD-01 | ✅ |
| U1 | FR-01–FR-07, NFR-01, NFR-04, AD-01–AD-03 | ✅ |
| U1-V | NFR-01, NFR-03 | ✅ |
| U2 | FR-01–FR-07, NFR-01, NFR-04, AD-01–AD-03 | ✅ |
| U3 | FR-01–FR-07, NFR-01, NFR-04, AD-01–AD-03 | ✅ |
| U4 | FR-01–FR-07, NFR-01, NFR-04, AD-01–AD-03 | ✅ |
| U5 | FR-01–FR-07, NFR-01, NFR-04, AD-01–AD-03 | ✅ |
| U6-I | FR-07, NFR-05 | ✅ |
| U6-D | NFR-02 | ✅ |
| U6-G | NFR-03 | ✅ |

**Result**: All 10 units are justified by at least one requirement. No orphan units.
