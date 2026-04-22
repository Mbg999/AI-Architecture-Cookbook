# Services — AI Architecture Cookbook

## Service Map

This is a knowledge repository, not a traditional service-oriented system. "Services" here represent logical service boundaries — the functional capabilities the system provides to consumers (AI assistants and human contributors).

| # | Service | Provider Component(s) | Consumer(s) | Protocol |
|---|---------|----------------------|-------------|----------|
| S1 | Content Service | C1 (Entries), C2 (Index) | AI assistants, MCP Server, Skills, Prompts | File system / YAML parsing |
| S2 | Discovery Service | C2 (Index), C4 (MCP Server) | AI assistants | MCP tools / file read |
| S3 | Recommendation Service | C4 (MCP Server) | AI assistants | MCP tool: recommend_pattern |
| S4 | Instruction Service | C5 (Skills), C6 (Prompts) | AI assistants | Skill loading / instruction file |
| S5 | Validation Service | C7 (Validation System) | CI pipeline, Contributors | CLI / GitHub Actions |
| S6 | Governance Service | C8 (Governance) | Contributors | PR workflow / GitHub |

---

## S1: Content Service

**Purpose**: Provide structured architectural standard content to consumers.

**Operations**:
- Read a single entry by domain path
- Read all entries in a category
- Read the global index for catalog overview

**Quality Contract**: Every entry conforms to base-template.yaml v3. No entry has placeholder content.

---

## S2: Discovery Service

**Purpose**: Help AI assistants find the right standard(s) for their current task.

**Operations**:
- Search by tags (e.g., "security", "api")
- Filter by category (e.g., "foundational")
- Free-text search across descriptions and domains
- Load category `_index.yaml` for scoped discovery

**Access Patterns**:
1. **MCP path**: AI calls `search_standards()` tool → gets metadata → calls `query_standard()` for full content
2. **File path**: AI reads `index.yaml` → identifies domain → reads `{category}/{domain}/{domain}.yaml`
3. **Skills path**: AI loads `ai-architecture-cookbook.md` → follows instructions to locate relevant YAML

---

## S3: Recommendation Service

**Purpose**: Evaluate context inputs against decision trees and recommend patterns.

**Operation**: `recommend_pattern(context, domains?)` — AI provides project context (e.g., `needs_login: true, security_level: high, session_type: stateless`), server evaluates matching decision trees, returns ranked pattern recommendations with rationale.

**Logic**:
1. Match provided context keys against `context_inputs` of candidate entries
2. Apply defaults for missing non-required inputs
3. Evaluate `decision_tree` nodes in priority order
4. Return first matching pattern per entry, or fallback
5. Rank results by `decision_metadata.confidence`

---

## S4: Instruction Service

**Purpose**: Deliver architectural guidance in the format each AI assistant expects.

**Operations**:
- **Skills**: Load `ai-architecture-cookbook.md` → AI reads entry YAMLs as needed
- **Prompt files**: Load pre-built `.github/copilot-instructions.md`, `CLAUDE.md`, or `.cursorrules`
- **Custom composition**: Run `compose.py` to build instruction files with selected standards

---

## S5: Validation Service

**Purpose**: Ensure content quality and structural integrity.

**Operations**:
- Schema validation (JSON Schema against all YAML entries)
- Semantic validation (cross-references, completeness, index consistency)
- CI integration (GitHub Actions runs on every PR)

**Quality Gate**: PR cannot merge if validation fails.

---

## S6: Governance Service

**Purpose**: Manage community contributions and maintain quality.

**Operations**:
- PR template enforcement (checklist in PR description)
- Automated validation on PR (via CI)
- Review workflow (human review + automated checks)
- Contribution guide (`CONTRIBUTING.md`)
