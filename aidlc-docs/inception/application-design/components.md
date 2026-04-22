# Components — AI Architecture Cookbook

## Component Inventory

| # | Component | Type | Description | Artifacts |
|---|-----------|------|-------------|-----------|
| C1 | Cookbook Entries | Content | 33 YAML files conforming to base-template.yaml v3 | `{category}/{domain}/{domain}.yaml` |
| C2 | Index System | Content/Metadata | Global `index.yaml` + per-category `_index.yaml` for discovery | `index.yaml`, `{category}/_index.yaml` |
| C3 | Schema System | Schema | Canonical YAML template + formal JSON Schema | `base-template.yaml`, `tools/schema.json` |
| C4 | MCP Server | Application | TypeScript MCP server exposing 5 tools for AI assistant consumption | `mcp-server/` |
| C5 | Skills Package | Distribution | Single mega-skill file referencing all cookbook entries | `skills/ai-architecture-cookbook.md` |
| C6 | Prompt System | Distribution/Tooling | Modular per-standard instruction modules + composition tool | `prompts/modules/`, `prompts/compose.py` |
| C7 | Validation System | Tooling | JSON Schema structural validation + Python semantic validation | `tools/schema.json`, `tools/validate.py` |
| C8 | Governance | Documentation | CONTRIBUTING.md, PR templates, CI workflow | `.github/`, `CONTRIBUTING.md` |

---

## C1: Cookbook Entries

**Purpose**: The core content — each entry captures one architectural standard with decision trees, patterns, anti-patterns, checklists, examples, prompt recipes, and security hardening.

**Structure**: Each entry lives at `{category}/{domain}/{domain}.yaml` and conforms to `base-template.yaml` v3.

**Count**: 33 entries across 5 categories.

**Quality Gates**:
- Validates against `base-template.yaml` v3 (via JSON Schema)
- ≥3 patterns, ≥3 anti-patterns, ≥1 example, ≥4 prompt recipes
- All `required: true` fields populated
- Cross-references resolve to existing entries

---

## C2: Index System

**Purpose**: Enable AI assistants to discover and navigate entries without loading all 33 files.

**Files**:
- `index.yaml` (root) — Master catalog of all entries, categories, tags, relationships
- `{category}/_index.yaml` — Per-category metadata with entry list, descriptions, tags

**Design Rationale**: AI assistants load `index.yaml` first → identify relevant entry → load specific YAML. Two-level indexing (global + category) balances discovery breadth with token efficiency.

---

## C3: Schema System

**Purpose**: Define and enforce the canonical structure for all cookbook entries.

**Files**:
- `base-template.yaml` — Human-readable canonical schema with comments and operator spec
- `tools/schema.json` — Machine-enforceable JSON Schema derived from base-template.yaml

**Relationship**: `schema.json` is the formal validation artifact; `base-template.yaml` is the authoritative source of truth for humans and AI assistants reading the schema.

---

## C4: MCP Server

**Purpose**: Expose cookbook content via Model Context Protocol for AI assistants that support MCP tool calling.

**Technology**: TypeScript (Node.js) — aligns with MCP SDK ecosystem.

**Tools**: 5 tools (see component-methods.md for full signatures).

**Design Rationale**: Comprehensive toolset (Q3=C) including `recommend_pattern` — AI provides context inputs, server evaluates decision trees across all relevant entries, returns recommended patterns with rationale.

---

## C5: Skills Package

**Purpose**: Single mega-skill file that AI assistants (GitHub Copilot, Claude, etc.) can load to gain access to all architectural standards.

**Design**: One `ai-architecture-cookbook.md` that describes the cookbook, lists all domains, and provides instructions for the AI to load specific YAML entries on demand (Q4=A).

**Design Rationale**: A mega-skill avoids fragmentation — AI loads one skill, gets a "router" that knows which YAML to fetch. Individual per-domain skills would require users to manually select which standards to enable.

---

## C6: Prompt System

**Purpose**: Generate pre-built instruction files for each AI assistant format (`.github/copilot-instructions.md`, `CLAUDE.md`, `.cursorrules`) from modular per-standard modules.

**Structure**:
- `prompts/modules/{domain}.md` — One instruction module per standard (33 files)
- `prompts/compose.py` — Generator script that composes selected modules into format-specific instruction files

**Design Rationale**: Modular + composition tool (Q5=D) gives users maximum flexibility — they pick which standards to include, and the tool generates the correct file for their AI assistant.

---

## C7: Validation System

**Purpose**: Ensure all cookbook entries conform to the v3 schema structurally and semantically.

**Components**:
- `tools/schema.json` — JSON Schema for structural validation (required fields, types, enums)
- `tools/validate.py` — Python script for semantic validation (cross-reference integrity, enum consistency, completeness checks, _index.yaml consistency)

**Design Rationale**: Dual validation (Q6=D) catches both structural errors (missing fields, wrong types) and semantic errors (broken cross-references, inconsistent tags, missing index entries).

---

## C8: Governance

**Purpose**: Enable community contributions with quality standards.

**Files**:
- `CONTRIBUTING.md` — Contribution guide with template, PR checklist, quality standards
- `.github/PULL_REQUEST_TEMPLATE.md` — PR template with validation checklist
- `.github/workflows/validate.yml` — CI workflow running schema + semantic validation
- `README.md` — Comprehensive project documentation with usage instructions
