# Unit Test Execution

## Test Categories

This project has three testable components:

| Component | Tool | Test Type |
|-----------|------|-----------|
| Cookbook entries (33 YAML) | `tools/validate.py` | Schema + semantic validation |
| MCP server (TypeScript) | `npx tsc --noEmit` | Type checking (compile-time correctness) |
| Prompt composer (Python) | Manual smoke test | Functional output verification |

## 1. Cookbook Entry Validation (Primary)

The validation suite is the project's primary "unit test" — every entry is independently validated against the JSON Schema and semantic rules.

### Run All Validations

```bash
python3 tools/validate.py
```

### What It Checks

| Check Category | Tests |
|---------------|-------|
| **Schema (structural)** | Required fields, types, enum values, ID formats, semver |
| **Cross-references** | Prerequisites resolve, related_standards resolve |
| **Completeness** | ≥3 patterns, ≥3 anti-patterns, ≥1 example, ≥4 prompt recipes |
| **ID uniqueness** | Pattern, checklist, example, decision IDs unique per entry |
| **Priority contiguity** | Decision tree priorities are 1, 2, 3... without gaps |
| **Index sync** | `_index.yaml` entries match actual files on disk |

### Expected Results

```
Entries validated: 33
Passed: 33
Failed: 0
✓ All entries valid. (0 warnings)
```

### If Tests Fail

1. Read the error message — it shows file path and specific check that failed
2. Fix the YAML entry
3. Re-run `python3 tools/validate.py`
4. Repeat until 33/33 pass

## 2. MCP Server Type Checking

```bash
cd mcp-server
npx tsc --noEmit
```

**Expected**: No output (clean compile). Any TypeScript errors will be printed with file/line.

## 3. Prompt Composer Smoke Test

### Generate all formats

```bash
# Copilot format — all standards
python3 prompts/compose.py --format copilot --standards all --output /tmp/test-copilot.md

# Claude format — single standard
python3 prompts/compose.py --format claude --standards authentication --output /tmp/test-claude.md

# Category filter
python3 prompts/compose.py --format generic --categories foundational --output /tmp/test-foundational.md
```

### Verify outputs

```bash
# Should be ~59KB with all 33 standards
wc -c /tmp/test-copilot.md

# Should contain all 5 category headers
grep -c "^# " /tmp/test-copilot.md

# Single standard should be much smaller
wc -c /tmp/test-claude.md

# Category filter should have 8 entries (foundational has 8)
grep -c "^## " /tmp/test-foundational.md
```

## 4. Quality Gate Summary

| Gate | Criteria | Status |
|------|----------|--------|
| All entries validate | 33/33 pass, 0 errors | ✅ |
| No XREF warnings | 0 warnings | ✅ |
| MCP server compiles | `tsc --noEmit` clean | ✅ |
| compose.py generates output | All 4 formats work | ✅ |
| ≥3 patterns per entry | Checked by validate.py | ✅ |
| ≥3 anti-patterns per entry | Checked by validate.py | ✅ |
| ≥1 example per entry | Checked by validate.py | ✅ |
| ≥4 prompt recipes per entry | Checked by validate.py | ✅ |
