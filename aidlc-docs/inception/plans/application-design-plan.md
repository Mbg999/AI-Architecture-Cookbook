# Application Design Plan

## Plan Overview
Design the architecture of the AI Architecture Cookbook repository itself — directory structure, distribution packaging, cross-reference system, schema validation, and consumption interfaces.

---

## Design Steps

- [x] **Step 1**: Define repository directory structure and naming conventions
- [x] **Step 2**: Define cross-reference and dependency resolution system
- [x] **Step 3**: Design distribution components (Skills, MCP, prompt files, raw repo)
- [x] **Step 4**: Design schema validation approach
- [x] **Step 5**: Design contribution workflow and governance
- [x] **Step 6**: Generate component artifacts (components.md, component-methods.md, services.md, component-dependency.md, application-design.md)

---

## Design Questions

Please answer by filling in the letter after each `[Answer]:` tag.

### Directory Structure

## Question 1
How should cookbook entries be organized in the repository?

A) Flat — all YAML files in root (e.g., `authentication.yaml`, `api-design.yaml`)
B) Domain directories — one directory per entry containing its YAML (e.g., `authentication/authentication.yaml`) ← current approach
C) Category grouping — entries grouped by category (e.g., `foundational/authentication/authentication.yaml`, `foundational/api-design/api-design.yaml`)
D) Category grouping with shared index — same as C but with a `_index.yaml` per category for metadata
X) Other (please describe after [Answer]: tag below)

[Answer]: D, is the better for ai assistants?

### Cross-Reference System

## Question 2
How should cross-references between entries work when an AI assistant loads a single entry?

A) Inline `related_standards` only (already in v3 template) — AI follows references if it has the repo
B) Add a global `index.yaml` at repo root that maps all entries, their tags, categories, and relationships — AI loads index first, then specific entries
C) Both — `related_standards` per entry AND a global index for discovery
X) Other (please describe after [Answer]: tag below)

[Answer]: B

### MCP Server Design

## Question 3
What tools should the MCP server expose for AI assistants?

A) Minimal: `query_standard(domain)` — returns the full YAML for a given domain
B) Standard: `query_standard(domain)`, `search_standards(tags)`, `get_checklist(domain)`, `get_decision_tree(domain)`
C) Comprehensive: All of B plus `recommend_pattern(context_inputs)` — AI provides context, MCP evaluates decision trees and returns recommended patterns
D) You decide based on what would be most useful for AI assistants
X) Other (please describe after [Answer]: tag below)

[Answer]: C

### Skills Package Design

## Question 4
How should Skills be structured for AI assistant consumption?

A) One mega-skill — single ai-architecture-cookbook.md that references all YAMLs
B) One skill per domain — `skills/authentication/ai-architecture-cookbook.md`, `skills/api-design/ai-architecture-cookbook.md`, etc.
C) One skill per category — `skills/foundational/ai-architecture-cookbook.md` covering all 7 foundational standards
D) Hybrid — one "router" skill that helps AI pick the right domain, plus individual domain skills
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Prompt File Design

## Question 5
How should pre-built instruction files be structured for each AI assistant format?

A) One monolithic file per format (e.g., one `.github/copilot-instructions.md` covering all standards)
B) Modular — one file per standard per format, user composes what they need
C) Template-based — provide a generator script that builds instruction files based on user's selected standards
D) Both B and C — modular files plus a composition tool
X) Other (please describe after [Answer]: tag below)

[Answer]: D

### Schema Validation

## Question 6
How should we validate that cookbook entries conform to base-template.yaml v3?

A) Manual review only — PR reviewers check against template
B) JSON Schema — create a formal JSON Schema for the YAML structure, validate in CI
C) Custom validation script (Python/Node) — deeper semantic checks beyond schema (e.g., cross-reference integrity, enum value consistency)
D) Both B and C — JSON Schema for structural validation + custom script for semantic validation
X) Other (please describe after [Answer]: tag below)

[Answer]: D

---
