# Cycle 3 — Requirements Clarification Questions

Please answer the following questions to help clarify the scope of the "hooks for AI assistants" feature.

## Current State

Already present in the repo:
- `.vscode/mcp.json` — GitHub Copilot MCP auto-discovery
- `.github/copilot-instructions.md` — AI-DLC workflow instructions for Copilot

Not yet present:
- `.mcp.json` — Claude Code MCP auto-discovery (repo root)
- `.cursor/mcp.json` — Cursor MCP auto-discovery
- `CLAUDE.md` — Claude Code custom instructions
- `.cursorrules` — Cursor custom rules/instructions
- `.windsurfrules` — Windsurf custom rules/instructions
- Git hooks (e.g., pre-commit validation)
- Setup script (auto-installs/configures for all clients)

---

## Question 1
What do you mean by "hooks"? Which type of integration files should we add?

A) **MCP config files only** — Ship `.mcp.json` (Claude Code), `.cursor/mcp.json` (Cursor), etc. so clients auto-discover the MCP server on clone
B) **MCP configs + custom instruction files** — Also ship `CLAUDE.md`, `.cursorrules`, `.windsurfrules` with cookbook-aware instructions (like the existing `.github/copilot-instructions.md` but for AI-DLC)
C) **MCP configs + instruction files + git hooks** — All of the above plus pre-commit hooks that auto-validate YAML standards on commit
D) **Full integration kit** — All of the above plus a setup script (`scripts/setup.sh`) that builds the MCP server and optionally installs git hooks
X) Other (please describe after [Answer]: tag below)

[Answer]: D

## Question 2
Which AI assistant clients should be targeted?

A) All major clients: GitHub Copilot, Claude Code, Claude Desktop, Cursor, Windsurf, Cline
B) Top 3 only: GitHub Copilot, Claude Code, Cursor
C) GitHub Copilot and Claude Code only
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
For custom instruction files (`CLAUDE.md`, `.cursorrules`, etc.), what content should they include?

A) **Cookbook-aware instructions** — Instruct the AI to use the MCP server tools (`query_standard`, `search_standards`, etc.) when making architectural decisions, plus reference the cookbook's standards catalog
B) **AI-DLC workflow instructions** — Same as the existing `.github/copilot-instructions.md` (full AI-DLC workflow) adapted for each client format
C) **Both** — AI-DLC workflow + cookbook awareness combined
D) **Minimal pointer** — Just a short instruction saying "This repo has an MCP server for architectural standards — use it"
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4
Should the custom instruction files for other clients (CLAUDE.md, .cursorrules, etc.) include the full AI-DLC workflow like .github/copilot-instructions.md does?

A) Yes — replicate the full AI-DLC workflow for all clients so any AI assistant can run the lifecycle
B) No — only the cookbook-specific instructions (MCP tools, standards catalog); AI-DLC workflow stays Copilot-only
C) Partial — include a simplified version of AI-DLC for other clients, with a note to see the full version in `.github/copilot-instructions.md`
X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 5: Security Extensions
Should security extension rules be enforced for this project?

A) Yes — enforce all SECURITY rules as blocking constraints (recommended for production-grade applications)
B) No — skip all SECURITY rules (suitable for PoCs, prototypes, and experimental projects)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 6: Property-Based Testing Extension
Should property-based testing (PBT) rules be enforced for this project?

A) Yes — enforce all PBT rules as blocking constraints
B) Partial — enforce PBT rules only for pure functions and serialization round-trips
C) No — skip all PBT rules (suitable for simple config file generation)
X) Other (please describe after [Answer]: tag below)

[Answer]: C
