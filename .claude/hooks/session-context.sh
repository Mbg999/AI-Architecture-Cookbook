#!/usr/bin/env bash
# .claude/hooks/session-context.sh
# SessionStart hook: injects cookbook MCP tools and skill context into the session.
# Claude Code reads the JSON additionalContext and uses it throughout the session.

set -euo pipefail

REPO_ROOT="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"

# Check if MCP server is built
MCP_STATUS="not built"
if [ -f "$REPO_ROOT/mcp-server/dist/server.js" ]; then
  MCP_STATUS="ready"
fi

# Count standards
STANDARD_COUNT=$(find "$REPO_ROOT" -path "*/*/*.yaml" \
  ! -path "*/node_modules/*" \
  ! -path "*/_index.yaml" \
  ! -path "*/base-template.yaml" \
  ! -path "*/index.yaml" \
  ! -path "*/.venv/*" \
  ! -path "*/aidlc-docs/*" \
  ! -path "*/aidlc-rule-details/*" \
  ! -path "*/mcp-server/*" \
  ! -name "_index.yaml" \
  2>/dev/null | wc -l | tr -d ' ')

cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "AI Architecture Cookbook — ${STANDARD_COUNT} architectural standards available.\n\nMCP server status: ${MCP_STATUS}. If MCP tools are connected, use them for architectural decisions:\n- query_standard: Get full standard by domain (e.g. {\"domain\": \"authentication\", \"category\": \"foundational\"})\n- search_standards: Search by keyword/tag (e.g. {\"query\": \"OAuth\"})\n- get_checklist: Get verification checklist (e.g. {\"domain\": \"encryption\", \"severity\": \"critical\"})\n- get_decision_tree: Get decision tree for a domain (e.g. {\"domain\": \"api-design\"})\n- recommend_pattern: Get recommendations from context (e.g. {\"context\": {\"scale\": \"enterprise\", \"needs_login\": true}})\n\nSkill file: skills/ai-architecture-cookbook.md — use it to look up standards by domain when MCP is unavailable.\n\nCategories: foundational (11), application-architecture (9), infrastructure (7), security-quality (10), integration-data (6).\n\nWorkflow: 1) Identify domain(s) 2) Query via MCP or read YAML 3) Evaluate decision tree 4) Apply recommended pattern 5) Verify with checklist."
  }
}
EOF
