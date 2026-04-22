#!/usr/bin/env bash
# .claude/hooks/architecture-advisor.sh
# UserPromptSubmit hook: detects architecture-related prompts and injects
# additionalContext reminding Claude to consult the cookbook MCP tools / skill.

set -euo pipefail

INPUT=$(cat)
PROMPT=$(echo "$INPUT" | jq -r '.prompt // empty')

# Lowercase for matching
PROMPT_LC=$(echo "$PROMPT" | tr '[:upper:]' '[:lower:]')

# Architecture-related keyword groups → suggested MCP tool + domain
# Each entry: keywords|tool_suggestion|domains
MATCHES=()

# Authentication & authorization
if echo "$PROMPT_LC" | grep -qE 'auth(entication|orization|n|z)?|oauth|oidc|jwt|login|sign.?in|sso|saml|mfa|2fa|rbac|abac|permissions|access.?control'; then
  MATCHES+=("authentication/authorization → query_standard {\"domain\":\"authentication\"} or {\"domain\":\"authorization\"}")
fi

# API design
if echo "$PROMPT_LC" | grep -qE 'api|rest(ful)?|graphql|grpc|websocket|endpoint|swagger|openapi|http.?method|rate.?limit'; then
  MATCHES+=("api-design → query_standard {\"domain\":\"api-design\"}")
fi

# Data & persistence
if echo "$PROMPT_LC" | grep -qE 'database|sql|nosql|postgres|mongo|redis|cache|caching|orm|migration|schema|data.?model|persistence|repository'; then
  MATCHES+=("data-persistence → query_standard {\"domain\":\"data-persistence\"} or get_decision_tree {\"domain\":\"data-persistence\"}")
fi

# Security & encryption
if echo "$PROMPT_LC" | grep -qE 'security|encrypt|tls|ssl|cert|csp|cors|xss|csrf|injection|owasp|vulnerability|pen.?test|secret|vault|key.?management'; then
  MATCHES+=("security → search_standards {\"query\":\"security encryption\"} or get_checklist {\"domain\":\"encryption\",\"severity\":\"critical\"}")
fi

# Testing
if echo "$PROMPT_LC" | grep -qE 'test(ing|s)?|unit.?test|integration.?test|e2e|coverage|tdd|bdd|mock|stub|fixture|test.?pyramid'; then
  MATCHES+=("testing → query_standard {\"domain\":\"testing-strategies\"}")
fi

# Infrastructure & deployment
if echo "$PROMPT_LC" | grep -qE 'docker|container|kubernetes|k8s|helm|ci.?cd|pipeline|deploy|infra(structure)?|terraform|pulumi|bicep|iac|cloud'; then
  MATCHES+=("infrastructure → search_standards {\"query\":\"containerization ci-cd infrastructure\"}")
fi

# Architecture patterns
if echo "$PROMPT_LC" | grep -qE 'architect|microservice|monolith|modular|hexagonal|clean.?arch|ddd|domain.?driven|bounded.?context|solid|design.?pattern|dependency.?inject'; then
  MATCHES+=("architecture → search_standards {\"query\":\"architecture patterns\"} or recommend_pattern")
fi

# Error handling & resilience
if echo "$PROMPT_LC" | grep -qE 'error.?handl|circuit.?breaker|retry|fallback|resilien|chaos|bulkhead|timeout|fault.?toler'; then
  MATCHES+=("resilience → query_standard {\"domain\":\"error-handling\"} or {\"domain\":\"resilience-chaos-engineering\"}")
fi

# Observability
if echo "$PROMPT_LC" | grep -qE 'log(ging)?|observ|monitor|metric|trac(ing|e)|alert|dashboard|apm|opentelemetry|prometheus|grafana'; then
  MATCHES+=("observability → query_standard {\"domain\":\"logging-observability\"}")
fi

# Messaging & events
if echo "$PROMPT_LC" | grep -qE 'message|queue|pub.?sub|event.?sourc|cqrs|kafka|rabbitmq|sqs|sns|event.?driven|async.?messag'; then
  MATCHES+=("messaging → query_standard {\"domain\":\"messaging-events\"}")
fi

# If no architecture keywords found, exit silently
if [ ${#MATCHES[@]} -eq 0 ]; then
  exit 0
fi

# Build the context string
CONTEXT="Cookbook standards detected for this request. Consider using these MCP tools before implementing:\n"
for match in "${MATCHES[@]}"; do
  CONTEXT="${CONTEXT}\n• ${match}"
done
CONTEXT="${CONTEXT}\n\nFull catalog: search_standards {\"query\":\"...\"} or read skills/ai-architecture-cookbook.md"

# Output as JSON additionalContext
jq -n --arg ctx "$CONTEXT" '{
  "hookSpecificOutput": {
    "hookEventName": "UserPromptSubmit",
    "additionalContext": $ctx
  }
}'
