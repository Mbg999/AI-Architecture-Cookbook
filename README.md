# AI Architecture Cookbook

Strongly opinionated architectural standards for AI code assistants. 43 domain-specific decision frameworks covering authentication, API design, containerization, encryption, testing, and more — each with context-aware decision trees, implementation patterns, anti-patterns, security hardening, and verification checklists.

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

Smoke test (quick verification)

After building, run a quick smoke test that spawns the server and calls a couple of tools. From the repository root:

```bash
cd mcp-server
# install (if not already)
npm install
# build TypeScript
npm run build
# run the programmatic stdio smoke client (it spawns the server and calls tools)
node --input-type=module dist/examples/stdio-client.mjs || node dist/examples/stdio-client.mjs
```

Expected output: two JSON-like responses printed for `search_standards` and `recommend_pattern`.

Environment and requirements

- Node: >=18 (recommended LTS)
- npm: latest compatible with Node 18+
- Python: 3.9+ for the `tools/validate.py` script (optional dev tooling)

Python (recommended venv workflow)

Use a virtual environment for the repository's Python tools and prompts:

```bash
# create a venv in the repo
python3 -m venv .venv

# macOS / Linux
source .venv/bin/activate

# Windows (PowerShell)
.venv\Scripts\Activate.ps1

# Windows (cmd)
.venv\Scripts\activate.bat

# Upgrade pip and install dependencies from the repo requirements
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

# Or install just the validator deps
python -m pip install pyyaml jsonschema

# When finished
deactivate
```

Notes:
- `requirements.txt` (repo root) is kept for the Python dev tooling; using `-r requirements.txt` installs all pinned versions.
- If you prefer `pipx` for isolated CLI tools, install the validator there instead of a venv.

JSON vs natural-language in clients

- Many MCP clients accept either: (A) a natural-language prompt that instructs the assistant to call a tool, or (B) a direct "Call tool" action where you provide the tool name and a JSON input object.
- If your client exposes a direct tool call UI, paste the JSON object from the examples. If using a chat-style interface, paste the natural-language example.


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

### Example MCP Prompts

Below are example prompts you can send to an AI assistant connected to the MCP server (for example, Copilot Chat, Claude Code, or Cursor). These prompts instruct the assistant to call the cookbook MCP tools (`query_standard`, `search_standards`, `get_checklist`, `get_decision_tree`, `recommend_pattern`). Adjust the `domain`, `category`, or `context` fields to match your query.

- Get a full standard (YAML):

```text
Call the tool `query_standard` with input: { "domain": "authentication", "category": "foundational" } and return the YAML content for that standard.
```

- Search for standards by keyword or tag:

```text
Call the tool `search_standards` with input: { "query": "OAuth", "tags": ["authentication"] } and summarize the top matches (domain, category, short description).
```

- Retrieve a checklist filtered by severity:

```text
Call the tool `get_checklist` with input: { "domain": "authentication", "severity": "critical" } and list the checklist items and their severity.
```

- Ask for decision-tree inputs or the full decision tree:

```text
Call the tool `get_decision_tree` with input: { "domain": "api-design" } and return the decision tree nodes and required context inputs.
```

- Request pattern recommendations for a project context:

```text
Call the tool `recommend_pattern` with input: { "context": { "scale": "enterprise", "client_types": ["web", "mobile"], "needs_login": true } } and return the top 3 recommended patterns with brief rationale.
```

These examples are ready to copy-paste into an assistant prompt when the MCP server is connected. The assistant will call the requested MCP tool and return structured results.

#### Calling from specific clients

Below are concise, copy-paste examples tailored to popular MCP clients. First ensure the MCP server is configured and running (see Option 1). Then paste the shown prompt into the client chat or command box.

- GitHub Copilot (VS Code)

  - Ensure you added the server to `.vscode/mcp.json` and started it via **MCP: List Servers**.
  - In Copilot Chat (Agent mode), paste:

  ```text
  Call the tool `query_standard` with input: { "domain": "authentication", "category": "foundational" } and return the YAML content.
  ```

- Claude Code / Claude Desktop

  - After `claude mcp add` (or adding the server in your Claude settings), open a chat and paste:

  ```text
  Call the tool `search_standards` with input: { "query": "OAuth" } and summarize the top matches (domain, category, short description).
  ```

- Cursor

  - With the MCP server registered in Cursor, open the assistant and paste:

  ```text
  Call the tool `get_checklist` with input: { "domain": "authentication", "severity": "critical" } and list checklist items and their severity.
  ```

- General guidance

  - Use the natural-language prompts above — the MCP-enabled assistant will route the request to the matching tool and return structured text. If your client exposes a direct "Call MCP tool" UI, provide the tool name and the JSON input object shown in the examples.

### Option 2: Skills / Custom Instructions

Copy `skills/ai-architecture-cookbook.md` into your AI assistant's skills directory. The skill instructs the AI to load specific YAML entries on demand.

Note: this file was previously named `SKILL.md` — it has been consolidated and renamed to `ai-architecture-cookbook.md` in the `skills/` directory to avoid ambiguity.

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
index.yaml                    → Master catalog (all 43 entries, tag index)
{category}/_index.yaml        → Category metadata
{category}/{domain}/{domain}.yaml → Full standard
```

## Standards Catalog

### Foundational (11 standards)
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
| [authorization](foundational/authorization/) | RBAC, ABAC, ReBAC, policy-as-code |
| [session-management](foundational/session-management/) | Server-side sessions, JWT rotation, BFF |
| [secrets-management](foundational/secrets-management/) | Vault services, rotation, zero-trust access |

### Application Architecture (9 standards)
| Standard | Description |
|----------|-------------|
| [layered-architecture](application-architecture/layered-architecture/) | Clean, hexagonal, onion architecture |
| [service-architecture](application-architecture/service-architecture/) | Microservices, modular monolith |
| [domain-driven-design](application-architecture/domain-driven-design/) | Bounded contexts, aggregates |
| [state-management](application-architecture/state-management/) | Client, server, distributed state |
| [dependency-injection](application-architecture/dependency-injection/) | DI, IoC, composition root |
| [repository-pattern](application-architecture/repository-pattern/) | Data access, unit of work |
| [design-patterns](application-architecture/design-patterns/) | SOLID principles, GoF patterns |
| [resilience-chaos-engineering](application-architecture/resilience-chaos-engineering/) | Circuit breakers, bulkheads, chaos experiments |
| [feature-flags](application-architecture/feature-flags/) | Progressive delivery, kill switches, A/B testing |

### Infrastructure (7 standards)
| Standard | Description |
|----------|-------------|
| [containerization](infrastructure/containerization/) | Docker, OCI, runtime security |
| [orchestration](infrastructure/orchestration/) | Kubernetes, service mesh |
| [ci-cd](infrastructure/ci-cd/) | Pipelines, release strategies |
| [infrastructure-as-code](infrastructure/infrastructure-as-code/) | Terraform, Pulumi, Bicep |
| [cloud-architecture](infrastructure/cloud-architecture/) | Cloud-native, well-architected |
| [database-migration](infrastructure/database-migration/) | Schema evolution, zero-downtime |
| [api-gateway-edge-security](infrastructure/api-gateway-edge-security/) | WAF, DDoS protection, zero-trust edge |

### Security & Quality (10 standards)
| Standard | Description |
|----------|-------------|
| [encryption](security-quality/encryption/) | TLS, cryptography, key management |
| [rate-limiting](security-quality/rate-limiting/) | Throttling, abuse prevention |
| [testing-strategies](security-quality/testing-strategies/) | Test pyramid, TDD, coverage |
| [code-quality](security-quality/code-quality/) | Linting, static analysis |
| [performance-optimization](security-quality/performance-optimization/) | Profiling, caching, scaling |
| [accessibility](security-quality/accessibility/) | WCAG, ARIA, inclusive design |
| [client-platform-security](security-quality/client-platform-security/) | CSP, cert pinning, root detection, anti-tamper |
| [secure-sdlc](security-quality/secure-sdlc/) | SAST, DAST, SCA, supply chain, SBOM |
| [compliance-data-privacy](security-quality/compliance-data-privacy/) | GDPR, CCPA, HIPAA, consent, data retention |
| [security-monitoring](security-quality/security-monitoring/) | SIEM, anomaly detection, incident response |

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

This repository was created alongside [awslabs/aidlc-workflows](https://github.com/awslabs/aidlc-workflows), an AI-assisted development lifecycle workflow toolkit. Using aidlc-workflows is recommended when adding new standards or making significant contributions — it provides structured inception, requirements analysis, design, and code-generation phases that keep contributions consistent and well-documented.

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on adding new standards or improving existing ones.

## License

[MIT](LICENSE)
