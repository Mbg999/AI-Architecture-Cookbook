# AI Architecture Cookbook

This repository contains 82 machine-readable architectural standards for AI code assistants.

## MCP Server

An MCP server is configured at `./mcp-server/dist/server.js`. If not already built, run:

```bash
cd mcp-server && npm install && npm run build
```

### Available Tools

| Tool | Description |
|------|-------------|
| `query_standard` | Get full details for a specific standard by domain and category |
| `search_standards` | Search by tags, categories, or free text |
| `get_checklist` | Get verification checklist (filterable by severity) |
| `get_decision_tree` | Get decision tree and context inputs for a domain |
| `recommend_pattern` | Provide project context, get pattern recommendations |

## When to Use

When implementing or reviewing any architectural component, **use the MCP tools** to look up the relevant standard before writing code. Key scenarios:

- Choosing between authentication methods → `query_standard { "domain": "authentication" }`
- Designing an API → `search_standards { "query": "REST GraphQL gRPC" }`
- Setting up infrastructure → `get_decision_tree { "domain": "containerization" }`
- Reviewing security → `get_checklist { "domain": "encryption", "severity": "critical" }`
- Starting a new service → `recommend_pattern { "context": { "scale": "enterprise", "needs_login": true } }`

## Standards Catalog (82 entries)

### Foundational (15)
api-design, authentication, authorization, configuration-management, data-persistence, error-handling, input-validation, logging-observability, messaging-events, session-management, secrets-management, api-composition-bff, caching-strategies, api-governance-portals, identity-federation-sso

### Application Architecture (28)
layered-architecture, service-architecture, domain-driven-design, state-management, ai-agent-architecture, dependency-injection, repository-pattern, design-patterns, resilience-chaos-engineering, feature-flags, frontend-component-architecture, micro-frontends, frontend-state-management, styling-design-systems, responsive-mobile-first, form-handling-patterns, internationalization-i18n, frontend-build-performance, pwa-offline-first, real-time-frontend, webassembly-frontend, prompt-engineering-patterns, multi-tenancy, workflow-orchestration, event-sourcing-cqrs, native-mobile-architecture, desktop-application-architecture, monorepo-architecture

### Infrastructure (12)
containerization, orchestration, ci-cd, infrastructure-as-code, cloud-architecture, database-migration, api-gateway-edge-security, model-serving-inference, serverless-functions, edge-computing, disaster-recovery-backup, finops-cost-optimization

### Security & Quality (14)
encryption, rate-limiting, testing-strategies, code-quality, performance-optimization, accessibility, client-platform-security, secure-sdlc, compliance-data-privacy, security-monitoring, frontend-testing, zero-trust-networking, observability-sre, threat-modeling

### Integration & Data (13)
third-party-integration, webhooks, file-storage, search, rag-architecture, llm-integration, vector-databases, data-transformation, versioning, real-time-streaming, data-resharding-partitioning, data-engineering-pipelines, mlops-lifecycle

## Workflow

1. **Identify** the relevant domain(s) for the task
2. **Query** the standard via MCP tools (or read the YAML directly from `{category}/{domain}/{domain}.yaml`)
3. **Evaluate** the decision tree with the project's context
4. **Apply** the recommended pattern's implementation guidance
5. **Verify** using the checklist (focus on critical and high severity items)

## Validation

To validate all standards: `python3 tools/validate.py`
