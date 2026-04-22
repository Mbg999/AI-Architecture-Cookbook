#!/usr/bin/env bash
set -euo pipefail

# AI Architecture Cookbook — Setup Script
# Builds the MCP server and optionally installs a git pre-commit hook
# that validates all YAML standards before each commit.

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "=== AI Architecture Cookbook Setup ==="
echo ""

# --- 1. Build MCP Server ---
echo ">> Building MCP server..."
cd "$REPO_ROOT/mcp-server"
npm install --no-fund --no-audit
npm run build
echo "   MCP server built successfully."
echo ""

# --- 2. Python dependencies (optional) ---
if command -v python3 &>/dev/null; then
  echo ">> Installing Python validation dependencies..."
  if [ -d "$REPO_ROOT/.venv" ]; then
    source "$REPO_ROOT/.venv/bin/activate" 2>/dev/null || true
  fi
  python3 -m pip install -q pyyaml jsonschema 2>/dev/null || echo "   (pip install skipped — install manually: pip install pyyaml jsonschema)"
  echo ""
fi

# --- 3. Install git pre-commit hook ---
HOOKS_DIR="$REPO_ROOT/.git/hooks"
HOOK_FILE="$HOOKS_DIR/pre-commit"

if [ -d "$REPO_ROOT/.git" ]; then
  echo ">> Install git pre-commit hook? (validates YAML standards before each commit)"
  read -r -p "   Install hook? [Y/n] " answer
  answer="${answer:-Y}"
  if [[ "$answer" =~ ^[Yy]$ ]]; then
    mkdir -p "$HOOKS_DIR"
    cat > "$HOOK_FILE" << 'HOOK'
#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"

# Only run if YAML standards were modified
CHANGED=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(yaml|yml)$' || true)
if [ -z "$CHANGED" ]; then
  exit 0
fi

echo ">> Pre-commit: validating YAML standards..."

# Activate venv if present
if [ -f "$REPO_ROOT/.venv/bin/activate" ]; then
  source "$REPO_ROOT/.venv/bin/activate"
elif [ -f "$REPO_ROOT/.venv/Scripts/activate" ]; then
  source "$REPO_ROOT/.venv/Scripts/activate"
fi

if command -v python3 &>/dev/null; then
  python3 "$REPO_ROOT/tools/validate.py"
elif command -v python &>/dev/null; then
  python "$REPO_ROOT/tools/validate.py"
else
  echo "   Warning: python not found, skipping validation"
fi
HOOK
    chmod +x "$HOOK_FILE"
    echo "   Pre-commit hook installed at $HOOK_FILE"
  else
    echo "   Skipped hook installation."
  fi
else
  echo ">> Not a git repository — skipping hook installation."
fi

echo ""
echo "=== Setup complete ==="
echo ""
echo "MCP server is ready. Your AI assistant should auto-discover it via:"
echo "  • GitHub Copilot  → .vscode/mcp.json"
echo "  • Claude Code     → .mcp.json"
echo "  • Cursor          → .cursor/mcp.json"
echo "  • Windsurf        → configure manually (see README.md)"
echo "  • Cline           → configure manually (see README.md)"
echo ""
echo "Custom instructions shipped for:"
echo "  • GitHub Copilot  → .github/copilot-instructions.md"
echo "  • Claude Code     → CLAUDE.md"
echo "  • Cursor          → .cursorrules"
echo "  • Windsurf        → .windsurfrules"
