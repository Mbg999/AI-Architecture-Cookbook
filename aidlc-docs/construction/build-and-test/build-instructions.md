# Build Instructions

## Prerequisites

| Requirement | Version | Purpose |
|-------------|---------|---------|
| Python | ≥ 3.9 | Validation tooling, prompt composer |
| Node.js | ≥ 18 | MCP server |
| npm | ≥ 9 | MCP server dependencies |
| PyYAML | latest | YAML parsing (`pip install pyyaml`) |
| jsonschema | latest | JSON Schema validation (`pip install jsonschema`) |

## Build Steps

### 1. Install Python Dependencies

```bash
pip install pyyaml jsonschema
```

### 2. Install MCP Server Dependencies

```bash
cd mcp-server
npm install
```

### 3. Build MCP Server

```bash
cd mcp-server
npm run build
```

**Expected output**: TypeScript compiles with no errors. Artifacts in `mcp-server/dist/`.

### 4. Validate All Cookbook Entries

```bash
python3 tools/validate.py
```

**Expected output**:
```
Entries validated: 33
Passed: 33
Failed: 0
✓ All entries valid. (0 warnings)
```

### 5. Smoke-Test Prompt Composer

```bash
python3 prompts/compose.py --format copilot --standards all --output /tmp/test-copilot.md
```

**Expected output**: File generated, ~59KB, 132+ sections.

### 6. Regenerate Root Index (optional)

The root `index.yaml` can be regenerated from entry metadata:

```bash
python3 -c "
import yaml, os
# ... (see generation script in Batch 6 notes)
"
```

## Build Artifacts

| Artifact | Path | Description |
|----------|------|-------------|
| Compiled MCP server | `mcp-server/dist/` | JavaScript output (ES2022) |
| Validation report | stdout | 33/33 pass, 0 warnings |
| Generated instructions | stdout or `--output` path | Copilot/Claude/Cursor instruction files |

## Troubleshooting

### Python dependency errors
```bash
pip install --upgrade pyyaml jsonschema
```

### MCP server TypeScript errors
```bash
cd mcp-server && rm -rf node_modules dist && npm install && npm run build
```

### YAML parsing errors in entries
Run `python3 tools/validate.py` — the report shows which file and line has the error.
