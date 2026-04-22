# AI Architecture Cookbook

Strongly opinionated architectural standards for AI code assistants. 33 domain-specific decision frameworks covering authentication, API design, containerization, encryption, testing, and more — each with context-aware decision trees, implementation patterns, anti-patterns, security hardening, and verification checklists.

## Why?

AI code assistants generate better code when given explicit architectural guidance. This cookbook provides machine-readable standards that AI assistants can load and follow — turning "use best practices" into concrete, evaluable decision trees.

## Quick Start

Choose the integration method that fits your workflow:

### Option 1: MCP Server (richest experience)

Build first:
```bash
cd mcp-server && npm install && npm run build
```

Then configure your AI assistant:

<details>
<summary><strong>GitHub Copilot (VS Code)</strong></summary>

Create `.vscode/mcp.json` in your project root:
```json
{
  "servers": {
    "ai-architecture-cookbook": {
      "command": "node",
      "args": ["${workspaceFolder}/mcp-server/dist/server.js"]
    }
  }
}
```
Then in VS Code: `Cmd+Shift+P` → **MCP: List Servers** → Start the server.
Use **Copilot Chat in Agent mode** to call the tools automatically.

</details>

<details>
<summary><strong>Claude Code</strong></summary>

Run from the repo root:
```bash
claude mcp add ai-architecture-cookbook node mcp-server/dist/server.js
```

Or add manually to `.mcp.json` in your project root:
```json
{
  "mcpServers": {
    "ai-architecture-cookbook": {
      "command": "node",
      "args": ["./mcp-server/dist/server.js"]
    }
  }
}
```

For global access across all projects, add to `~/.claude/mcp.json` using the absolute path.

</details>

<details>
<summary><strong>Claude Desktop</strong></summary>

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):
```json
{
  "mcpServers": {
    "ai-architecture-cookbook": {
      "command": "node",
      "args": ["/absolute/path/to/AI-Architecture-Cookbook/mcp-server/dist/server.js"]
    }
  }
}
```
Restart Claude Desktop after saving.

</details>

<details>
<summary><strong>Cursor</strong></summary>

Create `.cursor/mcp.json` in your project root:
```json
{
  "mcpServers": {
    "ai-architecture-cookbook": {
      "command": "node",
      "args": ["./mcp-server/dist/server.js"]
    }
  }
}
```
Or configure globally in **Cursor Settings → MCP**.

</details>

<details>
<summary><strong>Windsurf (Codeium)</strong></summary>

Add to `~/.codeium/windsurf/mcp_config.json`:
```json
{
  "mcpServers": {
    "ai-architecture-cookbook": {
      "command": "node",
      "args": ["/absolute/path/to/AI-Architecture-Cookbook/mcp-server/dist/server.js"]
    }
  }
}
```

</details>

<details>
<summary><strong>Cline (VS Code extension)</strong></summary>

Open Cline settings → **MCP Servers** → **Add** and use:
- **Name**: `ai-architecture-cookbook`
- **Command**: `node`
- **Args**: `/absolute/path/to/AI-Architecture-Cookbook/mcp-server/dist/server.js`

Or edit `cline_mcp_settings.json` directly with the same `mcpServers` format as Claude.

</details>

<details>
<summary><strong>OpenCode / other MCP clients</strong></summary>

Any MCP-compatible client can connect via stdio. The general config pattern:
```json
{
  "mcpServers": {
    "ai-architecture-cookbook": {
      "command": "node",
      "args": ["/absolute/path/to/AI-Architecture-Cookbook/mcp-server/dist/server.js"]
    }
  }
}
```
Consult your client's documentation for the config file location.

</details>

#### Available MCP Tools

| Tool | Description |
|------|-------------|
| `query_standard` | Get full details for a specific standard |
| `search_standards` | Search by tags, categories, or free text |
| `get_checklist` | Get verification checklist (filterable by severity) |
| `get_decision_tree` | Get decision tree and context inputs |
| `recommend_pattern` | Provide project context, get pattern recommendations |

### Option 2: Skills / Custom Instructions

Copy `skills/SKILL.md` into your AI assistant's skills directory. The skill instructs the AI to load specific YAML entries on demand.

### Option 3: Generated Instruction Files

Generate pre-built instruction files for your AI assistant:

```bash
# GitHub Copilot
python3 prompts/compose.py --format copilot --standards all --output .github/copilot-instructions.md

# Claude
python3 prompts/compose.py --format claude --standards all --output CLAUDE.md

# Cursor
python3 prompts/compose.py --format cursor --standards all --output .cursorrules

# Select specific standards
python3 prompts/compose.py --format copilot --standards authentication,api-design,error-handling

# Select by category
python3 prompts/compose.py --format copilot --categories foundational,security-quality
```

### Option 4: Direct YAML Access

Read `index.yaml` for the full catalog, then load specific entries as needed:

```
index.yaml                    → Master catalog (all 33 entries, tag index)
{category}/_index.yaml        → Category metadata
{category}/{domain}/{domain}.yaml → Full standard
```

## Standards Catalog

### Foundational (8 standards)
| Standard | Description |
|----------|-------------|
| [authentication](foundational/authentication/) | OIDC, OAuth2, JWT, DPoP, mTLS |
| [api-design](foundational/api-design/) | REST, GraphQL, gRPC, WebSocket |
| [error-handling](foundational/error-handling/) | Circuit breakers, retries, fallbacks |
| [logging-observability](foundational/logging-observability/) | Structured logging, tracing, metrics |
| [data-persistence](foundational/data-persistence/) | SQL, NoSQL, caching, event stores |
| [input-validation](foundational/input-validation/) | Validation, sanitization, injection prevention |
| [messaging-events](foundational/messaging-events/) | Queues, pub/sub, event sourcing, CQRS |
| [configuration-management](foundational/configuration-management/) | Env vars, secrets, feature flags |

### Application Architecture (7 standards)
| Standard | Description |
|----------|-------------|
| [layered-architecture](application-architecture/layered-architecture/) | Clean, hexagonal, onion architecture |
| [service-architecture](application-architecture/service-architecture/) | Microservices, modular monolith |
| [domain-driven-design](application-architecture/domain-driven-design/) | Bounded contexts, aggregates |
| [state-management](application-architecture/state-management/) | Client, server, distributed state |
| [dependency-injection](application-architecture/dependency-injection/) | DI, IoC, composition root |
| [repository-pattern](application-architecture/repository-pattern/) | Data access, unit of work |
| [design-patterns](application-architecture/design-patterns/) | SOLID principles, GoF patterns |

### Infrastructure (6 standards)
| Standard | Description |
|----------|-------------|
| [containerization](infrastructure/containerization/) | Docker, OCI, runtime security |
| [orchestration](infrastructure/orchestration/) | Kubernetes, service mesh |
| [ci-cd](infrastructure/ci-cd/) | Pipelines, release strategies |
| [infrastructure-as-code](infrastructure/infrastructure-as-code/) | Terraform, Pulumi, Bicep |
| [cloud-architecture](infrastructure/cloud-architecture/) | Cloud-native, well-architected |
| [database-migration](infrastructure/database-migration/) | Schema evolution, zero-downtime |

### Security & Quality (6 standards)
| Standard | Description |
|----------|-------------|
| [encryption](security-quality/encryption/) | TLS, cryptography, key management |
| [rate-limiting](security-quality/rate-limiting/) | Throttling, abuse prevention |
| [testing-strategies](security-quality/testing-strategies/) | Test pyramid, TDD, coverage |
| [code-quality](security-quality/code-quality/) | Linting, static analysis |
| [performance-optimization](security-quality/performance-optimization/) | Profiling, caching, scaling |
| [accessibility](security-quality/accessibility/) | WCAG, ARIA, inclusive design |

### Integration & Data (6 standards)
| Standard | Description |
|----------|-------------|
| [third-party-integration](integration-data/third-party-integration/) | Vendor abstraction, circuit breakers |
| [webhooks](integration-data/webhooks/) | Delivery guarantees, idempotent processing |
| [file-storage](integration-data/file-storage/) | Object storage, CDN, presigned URLs |
| [search](integration-data/search/) | Full-text search, indexing strategies |
| [data-transformation](integration-data/data-transformation/) | ETL/ELT, streaming pipelines |
| [versioning](integration-data/versioning/) | API versioning, backward compatibility |

## Entry Structure

Every standard follows `base-template.yaml` v3:

```
meta                → Domain, version, tags, prerequisites, related standards
context_inputs      → Parameters for decision tree evaluation
decision_tree       → Priority-ordered if/then/else rules
decision_metadata   → Confidence level, risk, fallback pattern
patterns            → Implementation details with code examples
examples            → Correct and incorrect code
security_hardening  → 6 categories (transport, data protection, access control, etc.)
compliance          → Standards references (RFCs, OWASP, etc.)
prompt_recipes      → Pre-built prompts for common scenarios
anti_patterns       → What to avoid, with detection and migration
checklist           → Verification items with severity
```

## How Decision Trees Work

Each standard has a decision tree that maps your context to a recommended pattern:

1. **Provide context**: Answer questions like "What client types?" "What scale?"
2. **Evaluate rules**: Walk the tree from priority 1 downward
3. **Get recommendation**: First matching rule gives you the pattern
4. **Fallback**: If nothing matches, use the declared fallback pattern

Example (authentication):
```
IF client_types == web AND needs_login == true
  THEN → oidc_authorization_code (OAuth2 + PKCE)

IF client_types == server AND needs_login == false
  THEN → mtls_authentication (mutual TLS for service-to-service)

FALLBACK → oidc_authorization_code
```

## Validation

```bash
# Validate all entries
python3 tools/validate.py

# Checks performed:
# - JSON Schema compliance (structure, types, enums)
# - Cross-reference integrity (prerequisites, related standards)
# - Completeness (≥3 patterns, ≥3 anti-patterns, ≥1 example, ≥4 recipes)
# - ID uniqueness and format
# - Index consistency
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on adding new standards or improving existing ones.

## License

[MIT](LICENSE)
