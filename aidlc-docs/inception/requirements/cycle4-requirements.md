# Cycle 4 — Requirements: Human-Readable README.md for Every Standard

## Intent Analysis
- **User Request**: Generate a comprehensive, human-readable README.md for every YAML standard in the repository (43 total), and improve the existing authentication/README.md
- **Request Type**: Enhancement (documentation generation)
- **Scope**: All 43 standard directories across 5 categories
- **Complexity**: Moderate (repetitive pattern, high volume)

## Functional Requirements

### FR-01: README Template Structure
Each README.md MUST contain these sections (in order), derived from the corresponding YAML:

1. **Title**: `# {Domain Name} — Summary`
2. **Short summary**: Purpose and scope (from `meta.description`)
3. **Related Standards**: Cross-references (from `meta.related_standards`)
4. **Context Inputs**: What context drives the decision tree (from `context_inputs`)
5. **Decision Tree**: Both Mermaid flowchart AND text fallback (from `decision_tree`)
6. **Patterns**: For each pattern in `patterns`:
   - Description
   - Use when / Avoid when
   - Tradeoffs (pros/cons)
   - Implementation guidelines
   - Common errors (error → impact → fix)
   - Maturity level
   - Standards/references
7. **Examples**: Correct vs incorrect pseudocode with explanations (from `examples`)
8. **Security Hardening**: Requirements by category (from `security_hardening`)
9. **Anti-Patterns**: Name, description, fix, severity (from `anti_patterns`)
10. **Checklist**: Full table with ID, description, severity, category (from `checklist`)
11. **Compliance**: Standards and requirements mapping (from `compliance`, if present)
12. **Prompt Recipes**: Scenario descriptions and prompts (from `prompt_recipes`, if present)
13. **Links**: Link to full YAML file

### FR-02: Conditional Sections
- Sections only appear if the YAML has the corresponding key
- e.g., `compliance` and `prompt_recipes` are optional in v3 schema — skip if absent

### FR-03: Mermaid Decision Tree
- Generate a Mermaid `flowchart TD` from `decision_tree` entries
- Each node shows the conditions and resulting pattern
- Include priority ordering
- Include text fallback below the Mermaid block

### FR-04: Improve Existing authentication/README.md
- Replace the existing lightweight README with the comprehensive format
- Same template as all other READMEs

### FR-05: Batch Execution
- 43 READMEs total, organized by category:
  - Batch 1: Foundational (11)
  - Batch 2: Application Architecture (9)
  - Batch 3: Infrastructure (7)
  - Batch 4: Security & Quality (10)
  - Batch 5: Integration & Data (6)

## Non-Functional Requirements

### NFR-01: Consistency
- Every README follows the identical template structure
- Tone: technical, concise, no marketing language
- All Mermaid diagrams validated before writing

### NFR-02: Accuracy
- README content MUST be a faithful rendering of the YAML — no invented content
- Every fact traces to a specific YAML key

### NFR-03: GitHub Rendering
- Mermaid diagrams must render correctly on GitHub
- Proper markdown syntax (headers, tables, code blocks)
- No broken links

### NFR-04: Maintainability
- README is a derived artifact — the YAML remains the source of truth
- README should note: "Full standard: [domain.yaml](domain.yaml)"

## Extension Configuration (carried from Cycle 1)
| Extension | Enabled | Decided At |
|---|---|---|
| Security Baseline | Yes | Requirements Analysis (Cycle 1) |
| Property-Based Testing | Yes (Full) | Requirements Analysis (Cycle 1) |

## Deliverables
- 43 README.md files (1 per standard directory)
- 1 updated authentication/README.md (upgraded from lightweight to comprehensive)
