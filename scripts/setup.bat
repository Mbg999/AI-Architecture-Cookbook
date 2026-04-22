@echo off
setlocal enabledelayedexpansion

REM AI Architecture Cookbook — Setup Script (Windows cmd)
REM Builds the MCP server and optionally installs a git pre-commit hook
REM that validates all YAML standards before each commit.

set "REPO_ROOT=%~dp0.."
pushd "%REPO_ROOT%"
set "REPO_ROOT=%CD%"
popd

echo === AI Architecture Cookbook Setup ===
echo.

REM --- 1. Build MCP Server ---
echo ^>^> Building MCP server...
pushd "%REPO_ROOT%\mcp-server"
call npm install --no-fund --no-audit
call npm run build
popd
echo    MCP server built successfully.
echo.

REM --- 2. Python dependencies (optional) ---
where python3 >nul 2>&1
if %errorlevel%==0 (
    set "PYTHON=python3"
) else (
    where python >nul 2>&1
    if %errorlevel%==0 (
        set "PYTHON=python"
    ) else (
        set "PYTHON="
    )
)

if defined PYTHON (
    echo ^>^> Installing Python validation dependencies...
    if exist "%REPO_ROOT%\.venv\Scripts\activate.bat" (
        call "%REPO_ROOT%\.venv\Scripts\activate.bat"
    )
    %PYTHON% -m pip install -q pyyaml jsonschema 2>nul || echo    ^(pip install skipped — install manually: pip install pyyaml jsonschema^)
    echo.
)

REM --- 3. Install git pre-commit hook ---
set "GIT_DIR=%REPO_ROOT%\.git"
set "HOOKS_DIR=%GIT_DIR%\hooks"
set "HOOK_FILE=%HOOKS_DIR%\pre-commit"

if exist "%GIT_DIR%" (
    echo ^>^> Install git pre-commit hook? ^(validates YAML standards before each commit^)
    set /p "ANSWER=   Install hook? [Y/n] "
    if "!ANSWER!"=="" set "ANSWER=Y"

    if /i "!ANSWER!"=="Y" (
        if not exist "%HOOKS_DIR%" mkdir "%HOOKS_DIR%"
        (
            echo #!/usr/bin/env bash
            echo set -euo pipefail
            echo.
            echo REPO_ROOT="$^(git rev-parse --show-toplevel^)"
            echo.
            echo # Only run if YAML standards were modified
            echo CHANGED=$^(git diff --cached --name-only --diff-filter=ACM ^| grep -E '\.\(yaml^|yml\)$' ^|^| true^)
            echo if [ -z "$CHANGED" ]; then
            echo   exit 0
            echo fi
            echo.
            echo echo "^>^> Pre-commit: validating YAML standards..."
            echo.
            echo # Activate venv if present
            echo if [ -f "$REPO_ROOT/.venv/bin/activate" ]; then
            echo   source "$REPO_ROOT/.venv/bin/activate"
            echo elif [ -f "$REPO_ROOT/.venv/Scripts/activate" ]; then
            echo   source "$REPO_ROOT/.venv/Scripts/activate"
            echo fi
            echo.
            echo if command -v python3 ^&^>/dev/null; then
            echo   python3 "$REPO_ROOT/tools/validate.py"
            echo elif command -v python ^&^>/dev/null; then
            echo   python "$REPO_ROOT/tools/validate.py"
            echo else
            echo   echo "   Warning: python not found, skipping validation"
            echo fi
        ) > "%HOOK_FILE%"
        echo    Pre-commit hook installed at %HOOK_FILE%
    ) else (
        echo    Skipped hook installation.
    )
) else (
    echo ^>^> Not a git repository — skipping hook installation.
)

echo.
echo === Setup complete ===
echo.
echo MCP server is ready. Your AI assistant should auto-discover it via:
echo   * GitHub Copilot  -^> .vscode/mcp.json
echo   * Claude Code     -^> .mcp.json
echo   * Cursor          -^> .cursor/mcp.json
echo   * Windsurf        -^> configure manually (see README.md)
echo   * Cline           -^> configure manually (see README.md)
echo.
echo Custom instructions shipped for:
echo   * GitHub Copilot  -^> .github/copilot-instructions.md
echo   * Claude Code     -^> CLAUDE.md
echo   * Cursor          -^> .cursorrules
echo   * Windsurf        -^> .windsurfrules

endlocal
