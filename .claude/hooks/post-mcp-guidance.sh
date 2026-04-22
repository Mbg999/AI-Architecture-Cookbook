#!/usr/bin/env bash
# .claude/hooks/post-mcp-guidance.sh
# PostToolUse hook: after a cookbook MCP tool returns results, injects guidance
# on how to act on the results (evaluate decision tree, apply pattern, verify).

set -euo pipefail

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

# Extract the MCP tool name (format: mcp__<server>__<tool>)
case "$TOOL_NAME" in
  mcp__ai-architecture-cookbook__query_standard)
    GUIDANCE="Standard loaded. Next: 1) Evaluate the decision_tree with the user's context 2) Apply the matched pattern's implementation guidance 3) Check common_errors 4) Verify with the checklist (focus on critical/high items)."
    ;;
  mcp__ai-architecture-cookbook__search_standards)
    GUIDANCE="Search results returned. Pick the most relevant domain and call query_standard to get the full standard with decision tree and patterns."
    ;;
  mcp__ai-architecture-cookbook__get_checklist)
    GUIDANCE="Checklist loaded. Walk through each item and verify the implementation meets the criteria. Flag any critical/high items that are not met."
    ;;
  mcp__ai-architecture-cookbook__get_decision_tree)
    GUIDANCE="Decision tree loaded. Gather the context_inputs from the user (or infer from codebase), walk the tree from priority 1 downward, and apply the first matching rule's pattern."
    ;;
  mcp__ai-architecture-cookbook__recommend_pattern)
    GUIDANCE="Pattern recommendation returned. Review the suggested pattern(s) and call query_standard for the full implementation details before writing code."
    ;;
  *)
    exit 0
    ;;
esac

jq -n --arg ctx "$GUIDANCE" '{
  "hookSpecificOutput": {
    "hookEventName": "PostToolUse",
    "additionalContext": $ctx
  }
}'
