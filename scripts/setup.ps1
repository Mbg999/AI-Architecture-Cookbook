# AI Architecture Cookbook — Setup Script (Windows)
# Builds the MCP server and optionally installs a git pre-commit hook
# that validates all YAML standards before each commit.

$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

Write-Host "=== AI Architecture Cookbook Setup ===" -ForegroundColor Cyan
Write-Host ""

# --- 1. Build MCP Server ---
Write-Host ">> Building MCP server..." -ForegroundColor Yellow
Push-Location "$RepoRoot\mcp-server"
npm install --no-fund --no-audit
npm run build
Pop-Location
Write-Host "   MCP server built successfully." -ForegroundColor Green
Write-Host ""

# --- 2. Python dependencies (optional) ---
$python = Get-Command python3 -ErrorAction SilentlyContinue
if (-not $python) { $python = Get-Command python -ErrorAction SilentlyContinue }

if ($python) {
    Write-Host ">> Installing Python validation dependencies..." -ForegroundColor Yellow
    $venvActivate = Join-Path $RepoRoot ".venv\Scripts\Activate.ps1"
    if (Test-Path $venvActivate) {
        & $venvActivate
    }
    try {
        & $python.Source -m pip install -q pyyaml jsonschema 2>$null
    } catch {
        Write-Host "   (pip install skipped - install manually: pip install pyyaml jsonschema)" -ForegroundColor DarkYellow
    }
    Write-Host ""
}

# --- 3. Install git pre-commit hook ---
$gitDir = Join-Path $RepoRoot ".git"
$hooksDir = Join-Path $gitDir "hooks"
$hookFile = Join-Path $hooksDir "pre-commit"

if (Test-Path $gitDir) {
    Write-Host ">> Install git pre-commit hook? (validates YAML standards before each commit)" -ForegroundColor Yellow
    $answer = Read-Host "   Install hook? [Y/n]"
    if ([string]::IsNullOrWhiteSpace($answer)) { $answer = "Y" }

    if ($answer -match "^[Yy]$") {
        if (-not (Test-Path $hooksDir)) { New-Item -ItemType Directory -Path $hooksDir -Force | Out-Null }

        $hookContent = @'
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
'@
        Set-Content -Path $hookFile -Value $hookContent -NoNewline -Encoding utf8
        Write-Host "   Pre-commit hook installed at $hookFile" -ForegroundColor Green
    } else {
        Write-Host "   Skipped hook installation."
    }
} else {
    Write-Host ">> Not a git repository - skipping hook installation." -ForegroundColor DarkYellow
}

Write-Host ""
Write-Host "=== Setup complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "MCP server is ready. Your AI assistant should auto-discover it via:"
Write-Host "  * GitHub Copilot  -> .vscode/mcp.json"
Write-Host "  * Claude Code     -> .mcp.json"
Write-Host "  * Cursor          -> .cursor/mcp.json"
Write-Host "  * Windsurf        -> configure manually (see README.md)"
Write-Host "  * Cline           -> configure manually (see README.md)"
Write-Host ""
Write-Host "Custom instructions shipped for:"
Write-Host "  * GitHub Copilot  -> .github/copilot-instructions.md"
Write-Host "  * Claude Code     -> CLAUDE.md"
Write-Host "  * Cursor          -> .cursorrules"
Write-Host "  * Windsurf        -> .windsurfrules"
