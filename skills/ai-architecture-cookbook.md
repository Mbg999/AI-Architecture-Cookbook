# AI Architecture Cookbook — Skill

Name: ai-architecture-cookbook

## Description
Comprehensive architectural standards and decision frameworks for software development. Provides 33 domain-specific standards covering authentication, API design, error handling, containerization, encryption, testing, and more. Each standard includes context-aware decision trees, implementation patterns, anti-patterns, security hardening, compliance mapping, and verification checklists.

## When to Use
- When implementing any architectural component (authentication, APIs, persistence, etc.)
- When making technology or pattern decisions (REST vs GraphQL, monolith vs microservices, etc.)
- When reviewing code for architectural compliance
- When setting up infrastructure (containers, CI/CD, IaC, cloud)
- When ensuring security, quality, or accessibility standards
- When integrating with third-party services, webhooks, or data pipelines

## How to Use

### Step 1: Identify the Domain
Match the user's request to one or more domains from the catalog below. If unsure, check multiple related domains.

### Step 2: Load the Standard
Read the YAML file at the path shown in the catalog. Each file contains:
- **context_inputs**: Questions to ask about the user's situation
- **decision_tree**: Priority-ordered rules that map context to recommended patterns
- **patterns**: Detailed implementation guidance with code examples and common errors
- **anti_patterns**: What NOT to do, with detection methods and migration paths
- **security_hardening**: Security checklist organized by category
- **checklist**: Verification items with severity and verification method
- **prompt_recipes**: Pre-built prompts for common scenarios

### Step 3: Evaluate the Decision Tree
1. Gather context inputs from the user (or infer from the codebase)
2. Walk the decision tree from priority 1 downward
3. First matching rule's `then.pattern` is the recommendation
4. If no rule matches, use `decision_metadata.fallback`

### Step 4: Apply the Pattern
Use the matched pattern's `implementation` section for code generation. Check `common_errors` to avoid known pitfalls.

### Step 5: Verify with Checklist
Run through the `checklist` items (especially `severity: critical` and `severity: high`) to validate the implementation.

---

## Domain Catalog

### Foundational Standards
Core cross-cutting concerns every system needs.

| Domain | Path | Description |
|--------|------|-------------|
| api-design | `foundational/api-design/api-design.yaml` | REST, GraphQL, gRPC, and WebSocket API patterns |
| authentication | `foundational/authentication/authentication.yaml` | OIDC, OAuth2, JWT, DPoP, mTLS authentication |
| configuration-management | `foundational/configuration-management/configuration-management.yaml` | Env vars, secrets, feature flags |
| data-persistence | `foundational/data-persistence/data-persistence.yaml` | SQL, NoSQL, caching, event stores |
| error-handling | `foundational/error-handling/error-handling.yaml` | Circuit breakers, retries, fallbacks, resilience |
| input-validation | `foundational/input-validation/input-validation.yaml` | Validation, sanitization, injection prevention |
| logging-observability | `foundational/logging-observability/logging-observability.yaml` | Structured logging, tracing, metrics |
| messaging-events | `foundational/messaging-events/messaging-events.yaml` | Queues, pub/sub, event sourcing, CQRS |

### Application Architecture
Structural and design patterns for applications.

| Domain | Path | Description |
|--------|------|-------------|
| dependency-injection | `application-architecture/dependency-injection/dependency-injection.yaml` | DI, IoC, composition root |
| design-patterns | `application-architecture/design-patterns/design-patterns.yaml` | SOLID principles, GoF patterns |
| domain-driven-design | `application-architecture/domain-driven-design/domain-driven-design.yaml` | Bounded contexts, aggregates, event storming |
| layered-architecture | `application-architecture/layered-architecture/layered-architecture.yaml` | Clean, hexagonal, onion architecture |
| repository-pattern | `application-architecture/repository-pattern/repository-pattern.yaml` | Data access, unit of work, query objects |
| service-architecture | `application-architecture/service-architecture/service-architecture.yaml` | Microservices, modular monolith, hybrid |
| state-management | `application-architecture/state-management/state-management.yaml` | Client, server, distributed state |

### Infrastructure & Deployment
Container, orchestration, CI/CD, and cloud patterns.

| Domain | Path | Description |
|--------|------|-------------|
| ci-cd | `infrastructure/ci-cd/ci-cd.yaml` | Pipelines, artifact management, release strategies |
| cloud-architecture | `infrastructure/cloud-architecture/cloud-architecture.yaml` | Cloud-native, multi-cloud, well-architected |
| containerization | `infrastructure/containerization/containerization.yaml` | Docker, OCI images, runtime security |
| database-migration | `infrastructure/database-migration/database-migration.yaml` | Schema evolution, zero-downtime migrations |
| infrastructure-as-code | `infrastructure/infrastructure-as-code/infrastructure-as-code.yaml` | Terraform, Pulumi, Bicep, CloudFormation |
| orchestration | `infrastructure/orchestration/orchestration.yaml` | Kubernetes, service mesh, workload management |

### Security & Quality
Security hardening, testing, and quality assurance.

| Domain | Path | Description |
|--------|------|-------------|
| accessibility | `security-quality/accessibility/accessibility.yaml` | WCAG, ARIA, inclusive design |
| code-quality | `security-quality/code-quality/code-quality.yaml` | Linting, static analysis, maintainability |
| encryption | `security-quality/encryption/encryption.yaml` | TLS, cryptography, key management |
| performance-optimization | `security-quality/performance-optimization/performance-optimization.yaml` | Profiling, caching, scalability |
| rate-limiting | `security-quality/rate-limiting/rate-limiting.yaml` | Throttling, abuse prevention, quotas |
| testing-strategies | `security-quality/testing-strategies/testing-strategies.yaml` | Test pyramid, TDD, coverage strategies |

### Integration & Data
External integrations, data pipelines, and versioning.

| Domain | Path | Description |
|--------|------|-------------|
| data-transformation | `integration-data/data-transformation/data-transformation.yaml` | ETL/ELT, streaming, schema evolution |
| file-storage | `integration-data/file-storage/file-storage.yaml` | Object storage, uploads, CDN |
| search | `integration-data/search/search.yaml` | Full-text search, indexing, Elasticsearch |
| third-party-integration | `integration-data/third-party-integration/third-party-integration.yaml` | Vendor abstraction, circuit breakers |
| versioning | `integration-data/versioning/versioning.yaml` | API versioning, backward compatibility |
| webhooks | `integration-data/webhooks/webhooks.yaml` | Webhook delivery, idempotent processing |

---

## Cross-Domain Guidance

When a task spans multiple domains, load all relevant standards and apply them in this priority order:
1. **Security** (authentication, encryption, input-validation, rate-limiting) — always first
2. **Architecture** (layered-architecture, service-architecture, domain-driven-design) — structural decisions
3. **Domain-specific** (api-design, data-persistence, messaging-events, etc.) — implementation patterns
4. **Quality** (testing-strategies, code-quality, performance-optimization, accessibility) — verification

### Common Combinations
- **New API endpoint**: api-design + authentication + input-validation + error-handling + rate-limiting
- **New microservice**: service-architecture + containerization + ci-cd + logging-observability
- **Database work**: data-persistence + database-migration + repository-pattern
- **Third-party integration**: third-party-integration + error-handling + logging-observability + webhooks
- **Frontend feature**: state-management + accessibility + performance-optimization + input-validation

---

## Schema Reference

Every YAML entry follows `base-template.yaml` v3 with these sections:
- `meta` — domain, version, tags, prerequisites, related standards
- `context_inputs` — parameters for decision tree evaluation
- `decision_tree` — priority-ordered if/then/else rules
- `decision_metadata` — confidence, risk, fallback pattern
- `patterns` — implementation details with code and common errors
- `examples` — correct and incorrect code examples
- `security_hardening` — transport, data_protection, access_control, input_output, secrets, monitoring
- `compliance` — standards references and requirements mapping
- `prompt_recipes` — pre-built prompts for common scenarios
- `anti_patterns` — what to avoid with detection and migration guidance
- `checklist` — verification items with severity and verification method

## Intent → Tool Mapping (quick reference)

Use this mapping to decide which MCP tool to call based on user intent. Include a short confirmation question if any required `context_inputs` are missing.

| Intent (user asks) | Tool to call | Example input / note |
|---|---:|---|
| Get full standard YAML or detailed guidance for a domain | `query_standard` | { "domain": "authentication", "category": "foundational" }
| Find standards by keyword, tag, or category | `search_standards` | { "query": "OAuth", "tags": ["authentication"] }
| Get verification checklist items (optionally filter by severity) | `get_checklist` | { "domain": "authentication", "severity": "critical" }
| Inspect decision tree inputs or full decision tree | `get_decision_tree` | { "domain": "api-design" }
| Recommend best patterns given project/context | `recommend_pattern` | { "context": { ... }, "domains": ["authentication"] }

### Practical routing rules
- If user explicitly requests machine-readable content (YAML, JSON) → call `query_standard`.
- If user asks "what standards cover X" or requests exploration → call `search_standards`.
- If user asks "how do I verify X is correct" or needs TODOs → call `get_checklist`.
- If user provides project context and asks for recommendations → call `recommend_pattern` and include `context` object.
- If user asks about decision criteria or what questions we need to answer → call `get_decision_tree`.

## Few-shot Prompt-Recipes (copy-paste)

These short recipes show natural-language examples and the equivalent direct tool call. Include at least one of these in system/prompts to teach assistants when to call tools.

- Example: full-standard (natural language)

```text
User: I need the full authentication standard YAML for our security audit.
Assistant: (calls `query_standard` with { "domain": "authentication", "category": "foundational" })
```

- Example: full-standard (direct tool)

```json
tool: query_standard
input: { "domain": "authentication", "category": "foundational" }
```

- Example: search standards (natural language)

```text
User: What standards or patterns mention OAuth or OpenID?
Assistant: (calls `search_standards` with { "query": "OAuth" })
```

- Example: checklist retrieval (natural language)

```text
User: Give me critical checklist items for authentication.
Assistant: (calls `get_checklist` with { "domain": "authentication", "severity": "critical" })
```

- Example: recommend pattern (few-shot)

```text
User: We run an enterprise web+mobile app that needs user login and SSO. Recommend authentication patterns.
Assistant: (calls `recommend_pattern` with { "context": { "scale": "enterprise", "client_types": ["web","mobile"], "needs_login": true } })
```

## Integration tips
- Expose these recipes as `prompt_recipes` inside each YAML standard so assistants can reuse domain-specific phrasing.
- Add these mappings to `skills/ai-architecture-cookbook.md` (done) and surface them in the README to help users author system messages.
- Require a one-line confirmation when context is incomplete: e.g., "I can call `recommend_pattern` — do you want me to use scale=enterprise and client_types=[web]?"

