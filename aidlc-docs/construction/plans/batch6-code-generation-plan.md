# Batch 6 — Code Generation Plan: Distribution & Governance

## Scope
Distribution packaging (4 channels), governance docs, CI pipeline. All 33 cookbook entries are complete and validated. This batch builds the infrastructure that makes them consumable.

## Steps

- [x] **Step 1**: Create root `index.yaml` — master catalog of all 33 entries with tag_index
- [x] **Step 2**: Create `skills/ai-architecture-cookbook.md` — mega-skill for AI assistants
- [x] **Step 3**: Create MCP server — `mcp-server/` (TypeScript, 5 tools)
  - `package.json`, `tsconfig.json`
  - `src/server.ts` — entry point
  - `src/loader.ts` — YAML loader + index reader
  - `src/evaluator.ts` — decision tree evaluator
  - `src/tools/query-standard.ts`
  - `src/tools/search-standards.ts`
  - `src/tools/get-checklist.ts`
  - `src/tools/get-decision-tree.ts`
  - `src/tools/recommend-pattern.ts`
- [x] **Step 4**: Create `prompts/compose.py` — reads YAML entries, generates instruction files
- [x] **Step 5**: Create governance docs
  - `CONTRIBUTING.md` — contribution guide + PR checklist
  - `.github/PULL_REQUEST_TEMPLATE.md` — PR template
- [x] **Step 6**: Create `.github/workflows/validate.yml` — CI validation on PRs
- [x] **Step 7**: Rewrite `README.md` — comprehensive project documentation
- [x] **Step 8**: Verify all distribution artifacts work
  - Run `python3.11 tools/validate.py` (entries still pass)
  - Run `python3.11 prompts/compose.py --format copilot --standards all` (smoke test)
  - Verify `mcp-server/` compiles (`npm install && npm run build`)

## Quality Criteria
- index.yaml lists all 33 entries with correct paths and tags
- ai-architecture-cookbook.md is self-contained and references all domains
- MCP server compiles and exports 5 tools
- compose.py generates valid instruction files
- CI workflow runs validate.py on PRs
- README covers installation, usage for all 4 distribution channels
