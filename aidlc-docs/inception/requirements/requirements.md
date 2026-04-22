# Requirements: AI Architecture Cookbook

## Intent Analysis

- **User Request**: Build an MIT-licensed open-source repository of architectural standards for AI code assistants, covering decision trees, checklists, patterns, anti-patterns, and implementation guidance — distributed as Skills, MCP servers, prompt files, and raw YAML.
- **Request Type**: New Project (greenfield knowledge repository)
- **Scope Estimate**: System-wide — 30+ architectural standard entries across 5 major domain categories
- **Complexity Estimate**: Complex — large scope, multiple distribution formats, community governance model

---

## Functional Requirements

### FR-01: Cookbook Entry Format
- Each architectural standard MUST be defined as a YAML file following the `base-template.yaml` schema
- YAML is the canonical format — optimized for machine parsing by AI code assistants
- Every entry MUST include: `meta`, `context_inputs`, `decision_tree`, `decision_metadata`, `patterns`, `security_hardening` (where applicable), `compliance`, `prompt_recipes`, `anti_patterns`, `checklist`
- The `base-template.yaml` MUST serve as the enforced schema — all entries validated against it

### FR-02: Comprehensive Standard Coverage
Each entry MUST provide full treatment:
- **Decision tree**: Context-aware conditional logic for when to use/avoid the pattern
- **Patterns**: Named patterns with `use_when`, `avoid_when`, `tradeoffs`, `implementation` guidelines, `maturity` level, and linked `standards`
- **Anti-patterns**: Named bad practices with `description`, `fix`, and `severity`
- **Checklist**: Validation items for implementation correctness
- **Compliance mapping**: Relevant industry standards (ISO, NIST, OWASP, etc.)
- **Prompt recipes**: Reusable prompts AI assistants can use to implement the standard

### FR-03: Strongly Opinionated Defaults
- Each decision tree MUST recommend a clear default path
- `decision_metadata.fallback` MUST provide a safe default decision
- `decision_metadata.confidence` and `risk_if_wrong` MUST be specified
- Competing standards (e.g., REST vs GraphQL) MUST both be covered with a decision tree to choose between them based on context

### FR-04: Technology-Agnostic Content
- All patterns and guidelines MUST be described abstractly (no technology-specific library names)
- Implementation guidelines use generic terms ("use a circuit breaker library", not "use Polly")
- Standards reference protocol/specification names, not implementations

### FR-05: Domain Coverage
The following domains MUST have at least one cookbook entry each:

**Foundational (Priority Group 1)**:
1. Authentication & Authorization *(exists: authentication.yaml)*
2. API Design (REST, GraphQL, gRPC, WebSocket)
3. Data Persistence (relational, NoSQL, caching, event stores)
4. Messaging & Event-Driven Architecture (queues, pub/sub, event sourcing, CQRS)
5. Error Handling & Resilience (circuit breakers, retries, fallbacks, bulkheads)
6. Logging, Observability & Monitoring (structured logging, tracing, metrics)
7. Configuration Management (env vars, secret management, feature flags)

**Application Architecture (Priority Group 2)**:
8. Layered Architecture (Clean, Hexagonal, Onion)
9. Microservices vs Monolith vs Modular Monolith
10. Domain-Driven Design (bounded contexts, aggregates, domain events)
11. State Management (client-side, server-side, distributed)
12. Dependency Injection & Inversion of Control
13. Repository & Unit of Work patterns
14. SOLID Principles & Design Patterns

**Infrastructure & Deployment (Priority Group 3)**:
15. Containerization (Docker best practices)
16. Orchestration (Kubernetes patterns, service mesh)
17. CI/CD Pipeline Design
18. Infrastructure as Code (Terraform, Pulumi, Bicep patterns)
19. Cloud Architecture Patterns (multi-region, DR, auto-scaling)
20. Database Migration & Schema Evolution

**Security & Quality (Priority Group 4)**:
21. Input Validation & Sanitization
22. Encryption (at rest, in transit, application-level)
23. Rate Limiting & Throttling
24. Testing Strategies (unit, integration, e2e, contract, property-based)
25. Code Quality (linting, formatting, static analysis)
26. Performance Optimization (caching, lazy loading, pagination)
27. Accessibility Standards

**Integration & Data (Priority Group 5)**:
28. Third-Party API Integration
29. Webhook Design & Consumption
30. File Upload/Download & Storage
31. Search Implementation (full-text, faceted, real-time)
32. Data Transformation & ETL
33. Versioning Strategies (API, schema, backward compatibility)

### FR-06: Build Priority Order
After authentication (already complete), build in this order based on universal importance and foundational dependency:

1. **API Design** — Every system needs APIs; other standards reference API patterns
2. **Error Handling & Resilience** — Cross-cutting; all other patterns depend on error handling
3. **Logging, Observability & Monitoring** — Cross-cutting; required for any production system
4. **Data Persistence** — Most systems need data storage; many patterns build on this
5. **Input Validation & Sanitization** — Security fundamental; referenced by API and persistence

Then continue through remaining foundational → application architecture → infrastructure → security/quality → integration/data.

### FR-07: Conflicting Standards Resolution
- When two or more standards solve the same problem differently (e.g., REST vs GraphQL, SQL vs NoSQL), BOTH must be covered as separate entries
- A parent or cross-reference decision tree MUST exist to help choose between them
- The `decision_tree` section of each entry MUST include conditions that point to the alternative when the current pattern is inappropriate

---

## Non-Functional Requirements

### NFR-01: AI-First Optimization
- YAML format chosen for optimal machine parsing and token efficiency
- Consistent schema across all entries (validated against `base-template.yaml`)
- No prose-heavy sections — structured data preferred over narrative
- Field names MUST be consistent and predictable across all entries

### NFR-02: Multi-Format Distribution
The cookbook MUST support these consumption methods:
- **Skills package**: Individual skill files per domain that AI assistants can load
- **MCP server**: A Model Context Protocol server with tools to query standards
- **Prompt/instruction files**: Pre-built instruction files for `.github/copilot-instructions.md`, `CLAUDE.md`, `.cursorrules`
- **Raw reference repo**: Direct cloning and file reading by AI assistants

### NFR-03: Community Governance
- CONTRIBUTING.md with template validation, PR checklist, and quality standards
- All entries MUST pass community PR review before merging
- The `base-template.yaml` schema enforces structural consistency
- MIT license for maximum openness

### NFR-04: Maintainability
- Each domain is a self-contained directory with its YAML file
- No cross-file dependencies that would break individual entries
- Version tracking via `meta.version` and `meta.last_updated` per entry

### NFR-05: Scalability
- Repository structure MUST support 30+ entries without navigation problems
- Clear directory organization by domain category
- README or index file for discovery

---

## Architectural Decisions

### AD-01: YAML as Canonical Format
**Decision**: Use YAML for all cookbook entries
**Rationale**: AI assistants parse structured YAML more reliably than freeform markdown. YAML supports the decision tree, pattern, and checklist structures naturally. The existing `base-template.yaml` and `authentication.yaml` validate this approach.

### AD-02: One File Per Standard
**Decision**: Each architectural standard lives in its own YAML file within a domain directory
**Rationale**: Self-contained entries allow AI assistants to load only what they need. Reduces token usage. Enables independent versioning and community contribution.

### AD-03: Strongly Opinionated with Escape Hatches
**Decision**: Every decision tree recommends a default, with clear conditions to choose alternatives
**Rationale**: AI assistants work best with clear guidance. The decision tree structure ensures the recommendation adapts to context while maintaining strong defaults.

---

## Extension Configuration

| Extension | Enabled | Decided At |
|---|---|---|
| Security Baseline | Yes | Requirements Analysis |
| Property-Based Testing | Yes (Full) | Requirements Analysis |

---
