# AI Architecture Cookbook

Strongly opinionated architectural standards for AI code assistants. 43 domain-specific decision frameworks covering authentication, API design, containerization, encryption, testing, and more — each with context-aware decision trees, implementation patterns, anti-patterns, security hardening, and verification checklists.

## Why?

AI code assistants generate better code when given explicit architectural guidance. This cookbook provides machine-readable standards that AI assistants can load and follow — turning "use best practices" into concrete, evaluable decision trees.

## Quick Start

Clone and run the setup script — it builds the MCP server and optionally installs a pre-commit validation hook:

```bash
# macOS / Linux
git clone <repo-url> && cd AI-Architecture-Cookbook
./scripts/setup.sh
```

```powershell
# Windows (PowerShell)
git clone <repo-url>; cd AI-Architecture-Cookbook
.\scripts\setup.ps1
```

```cmd
REM Windows (cmd)
git clone <repo-url> && cd AI-Architecture-Cookbook
scripts\setup.bat
```

Most AI assistants will **auto-discover the MCP server** on open — no manual configuration needed:

| Client | Auto-Discovery File | Custom Instructions |
|--------|---------------------|---------------------|
| GitHub Copilot (VS Code) | `.vscode/mcp.json` | `.github/copilot-instructions.md` |
| Claude Code | `.mcp.json` | `CLAUDE.md` |
| Cursor | `.cursor/mcp.json` | `.cursorrules` |
| Windsurf | *(manual — see below)* | `.windsurfrules` |
| Cline | *(manual — see below)* | *(uses CLAUDE.md format)* |

> **Note**: Windsurf and Cline require manual MCP config — see their setup sections below.

Choose an integration method for more detail:

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
Priority 1: IF client_types == server AND security_level in [high, critical]
              THEN → mtls_authentication (mutual TLS for service-to-service)

Priority 2: IF security_level in [high, critical] AND data_sensitivity == high
              THEN → sender_constrained_tokens (DPoP / mTLS PoP)

Priority 3: IF third_party_access == true
              THEN → delegated_authorization (OAuth2 scoped grants)

Priority 4: IF needs_login == true
              THEN → federated_authentication (OIDC + OAuth2)
              ELSE → delegated_authorization (OAuth2 for M2M)

Priority 5: IF session_type == stateless
              THEN → token_based_auth (JWT)

FALLBACK → federated_authentication
```

## Validation

The validator (`tools/validate.py`) checks every YAML entry against the v3 JSON Schema **and** a set of semantic rules to catch structural errors, missing content, broken cross-references, and index inconsistencies.

### What it checks

| Check | Description |
|-------|-------------|
| **JSON Schema compliance** | Structure, required fields, types, enums, string patterns (kebab-case domain, semver version, etc.) |
| **Quality gates** | Minimum content thresholds: ≥3 patterns, ≥3 anti-patterns, ≥1 example, ≥4 prompt recipes |
| **Cross-reference integrity** | `prerequisites` and `related_standards` point to known domains (warnings for future-batch refs) |
| **Decision tree consistency** | Every `then` / `else` pattern exists in the `patterns` list; condition variables match `context_inputs` |
| **Fallback consistency** | The `decision_metadata.fallback.pattern` references a defined pattern |
| **Anti-pattern references** | Each anti-pattern's `related_pattern` exists in `patterns` |
| **Checklist references** | `verified_by` fields point to a valid pattern or anti-pattern name |
| **ID uniqueness** | No duplicate checklist IDs; no duplicate decision-tree priorities |
| **Index consistency** | Every entry in `_index.yaml` has a matching YAML file, and vice versa |

### Usage examples

```bash
# Validate all 43 entries
python3 tools/validate.py
```

```
============================================================
AI Architecture Cookbook — Validation Report
============================================================
Entries validated: 43
Passed: 43
Failed: 0

✓ All entries valid. (0 warnings)
```

```bash
# Validate a single entry
python3 tools/validate.py foundational/authentication/authentication.yaml
```

```
============================================================
AI Architecture Cookbook — Validation Report
============================================================
Entries validated: 1
Passed: 1
Failed: 0

WARNINGS (non-blocking):

  foundational/authentication/authentication.yaml:
  XREF: related_standard 'encryption' not found in known domains (future batch?)
  XREF: related_standard 'input-validation' not found in known domains (future batch?)

✓ All entries valid. (2 warnings)
```

> **Note**: Cross-reference warnings are non-blocking — they flag references to domains
> not present in the validation scope (e.g., when validating a single file whose
> `related_standards` point to other entries).

```bash
# Validate an entire category
python3 tools/validate.py foundational/
```

When an entry **fails**, the report shows the specific errors:

```
FAIL foundational/authentication/authentication.yaml:
  SCHEMA [meta.domain]: 'Auth' does not match '^[a-z][a-z0-9-]*$'
  QUALITY: 2 patterns (minimum 3)
  CONSISTENCY: decision_tree node 'rule_1' references pattern 'oauth_basic' not defined in patterns
```

### Error categories

- **SCHEMA** — JSON Schema violations (wrong types, missing required fields, invalid formats)
- **QUALITY** — Below minimum content thresholds
- **XREF** — Cross-reference to an unknown domain (warning)
- **CONSISTENCY** — Internal reference mismatch (decision tree → patterns, checklist → verified_by, etc.)
- **INDEX** — Mismatch between `_index.yaml` listings and actual YAML files on disk

## Claude Code Hooks

The repository includes [Claude Code hooks](https://code.claude.com/docs/en/hooks) that automatically integrate the cookbook's MCP tools and skill into every session. Hooks are configured in `.claude/settings.json` and fire as lifecycle events — no manual invocation needed.

### What the hooks do

| Hook | Event | Trigger | Effect |
|------|-------|---------|--------|
| `session-context.sh` | SessionStart | Session begins or resumes | Injects `additionalContext` with MCP tool catalog, standard count, skill location, and usage workflow |
| `architecture-advisor.sh` | UserPromptSubmit | Every user prompt | Detects architecture-related keywords (auth, API, security, testing, etc.) and suggests specific MCP tool calls |
| `post-mcp-guidance.sh` | PostToolUse | After any `mcp__ai-architecture-cookbook__*` tool returns | Injects next-step guidance (evaluate decision tree → apply pattern → verify checklist) |

### How it works

1. **SessionStart** — Claude receives the full MCP tool catalog and skill reference at session start, so it knows the cookbook is available.
2. **UserPromptSubmit** — When you ask about authentication, API design, testing, etc., the hook detects the domain and injects a reminder with the exact MCP tool call to run (e.g., `query_standard {"domain":"authentication"}`).
3. **PostToolUse** — After an MCP tool returns results, the hook tells Claude what to do next: evaluate the decision tree, apply the pattern, or walk the checklist.

### Enabling the hooks

The hooks are committed to the repo and activate automatically when you open the project in Claude Code. No additional setup is required — Claude Code reads `.claude/settings.json` on session start.

> **Note**: These hooks are specific to Claude Code. For other AI assistants, use the git pre-commit hook installed by `scripts/setup.sh`, which provides equivalent validation at commit time.

## Contributing

This repository was created alongside [awslabs/aidlc-workflows](https://github.com/awslabs/aidlc-workflows), an AI-assisted development lifecycle workflow toolkit. Using aidlc-workflows is recommended when adding new standards or making significant contributions — it provides structured inception, requirements analysis, design, and code-generation phases that keep contributions consistent and well-documented.

### Adding a new standard with AI-DLC

The fastest way to contribute a new standard is to let AI-DLC drive the entire process. Open your AI assistant (Copilot Chat, Claude Code, Cursor, etc.) in the repo and paste a prompt like:

```text
Using AI-DLC, implement a new cookbook standard for "caching-strategies" in the
foundational category.

Requirements:
- Cover in-memory, distributed, and CDN caching patterns
- Include decision tree inputs: data_volatility, read_write_ratio, cache_location,
  scale, and consistency_requirement
- Provide at least 4 patterns: local_in_memory, distributed_redis,
  cdn_edge_caching, and write_through_cache
- Add anti-patterns for cache stampede, unbounded caches, and stale-while-revalidate misuse
- Include security hardening for cache poisoning and sensitive data leakage
- Reference related standards: performance-optimization, data-persistence, api-design
- Ensure the entry passes `python3 tools/validate.py` with zero errors
```

AI-DLC will walk through its adaptive workflow:

1. **Workspace Detection** — detects the existing cookbook (brownfield) and scans for reverse-engineering artifacts
2. **Requirements Analysis** — clarifies scope, quality gates (≥3 patterns, ≥3 anti-patterns, ≥4 recipes, etc.), and cross-references
3. **Application Design** — designs the YAML structure, decision tree nodes, and pattern details
4. **Code Generation** — creates `foundational/caching-strategies/caching-strategies.yaml`, updates `foundational/_index.yaml`, and adds the entry to `index.yaml`
5. **Build & Test** — runs `python3 tools/validate.py` to confirm schema compliance, cross-reference integrity, and index consistency

The result is a fully validated standard ready for pull request — with audit trail and design docs under `aidlc-docs/`.

> **Tip**: You can scope the prompt to any category. For example:
> `"Using AI-DLC, implement a new standard for 'graph-databases' in the integration-data category."`

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full manual guidelines on adding or improving standards.

## License

[MIT](LICENSE)
