# Requirements Verification Questions

Please answer each question by filling in the letter choice after the `[Answer]:` tag.  
If none of the options match, choose the last option (Other) and describe your preference.  
Let me know when you're done.

---

## SECTION 1: SCOPE & VISION

## Question 1
What is the primary delivery format for the cookbook entries?

A) YAML files only (like the existing `base-template.yaml` and `authentication.yaml`)
B) Markdown files with embedded YAML/code blocks
C) Mixed — YAML for machine-readable decision trees, Markdown for human-readable explanations
D) JSON or other structured format
X) Other (please describe after [Answer]: tag below)

[Answer]: X, the best one for the purpose, I trust your judgment, ai assistants like you will be the target

## Question 2
Who is the primary consumer of this cookbook?

A) AI code assistants only (Claude Code, Codex, GitHub Copilot, etc.) — optimized for machine parsing
B) Human developers only — optimized for readability and learning
C) Both AI assistants AND human developers — dual-purpose
X) Other (please describe after [Answer]: tag below)

[Answer]: A, AI code assistants only, the main goal is to provide a comprehensive, structured knowledge base that AI assistants can use to implement architectural standards in code. While human readability is a nice-to-have, the primary focus should be on making the content easily consumable and actionable for AI assistants, which will be the ones doing the heavy lifting of applying these standards in real projects.

## Question 3
What depth level should each architectural standard cover?

A) Decision tree + checklist only (lightweight, quick reference)
B) Decision tree + checklist + patterns + anti-patterns (standard depth, like the current authentication.yaml)
C) Full treatment: decision tree + checklist + patterns + anti-patterns + implementation guidelines + compliance mapping + prompt recipes (comprehensive, like authentication.yaml)
D) Tiered — some standards get full treatment, others get lightweight coverage based on importance
X) Other (please describe after [Answer]: tag below)

[Answer]: C, Full treatment: decision tree + checklist + patterns + anti-patterns + implementation guidelines + compliance mapping + prompt recipes (comprehensive, like authentication.yaml)

## Question 4
Should the cookbook be opinionated (recommending specific choices) or neutral (presenting options equally)?

A) Strongly opinionated — recommend best practices with clear defaults
B) Mildly opinionated — recommend defaults but present alternatives equally
C) Neutral — present all options equally, let the user/AI decide
X) Other (please describe after [Answer]: tag below)

[Answer]: A, Strongly opinionated — recommend best practices with clear defaults

---

## SECTION 2: ARCHITECTURAL DOMAINS TO COVER

## Question 5
Which of these FOUNDATIONAL domains should be included? (Select ALL that apply by listing letters)

A) Authentication & Authorization (already started)
B) API Design (REST, GraphQL, gRPC, WebSocket)
C) Data Persistence (relational, NoSQL, caching, event stores)
D) Messaging & Event-Driven Architecture (queues, pub/sub, event sourcing, CQRS)
E) Error Handling & Resilience (circuit breakers, retries, fallbacks, bulkheads)
F) Logging, Observability & Monitoring (structured logging, tracing, metrics)
G) Configuration Management (env vars, secret management, feature flags)
H) All of the above
X) Other (please describe after [Answer]: tag below)

[Answer]: H, All of the above

## Question 6
Which of these APPLICATION ARCHITECTURE domains should be included? (Select ALL that apply by listing letters)

A) Layered Architecture (Clean Architecture, Hexagonal/Ports & Adapters, Onion)
B) Microservices vs Monolith vs Modular Monolith decision framework
C) Domain-Driven Design (bounded contexts, aggregates, domain events)
D) State Management (client-side, server-side, distributed)
E) Dependency Injection & Inversion of Control
F) Repository & Unit of Work patterns
G) SOLID Principles & Design Patterns (Factory, Strategy, Observer, etc.)
H) All of the above
X) Other (please describe after [Answer]: tag below)

[Answer]: H, All of the above

## Question 7
Which of these INFRASTRUCTURE & DEPLOYMENT domains should be included? (Select ALL that apply by listing letters)

A) Containerization (Docker, container best practices)
B) Orchestration (Kubernetes patterns, service mesh)
C) CI/CD Pipeline Design
D) Infrastructure as Code (Terraform, Pulumi, Bicep patterns)
E) Cloud Architecture Patterns (multi-region, disaster recovery, auto-scaling)
F) Database Migration & Schema Evolution strategies
G) All of the above
X) Other (please describe after [Answer]: tag below)

[Answer]: G

## Question 8
Which of these SECURITY & QUALITY domains should be included? (Select ALL that apply by listing letters)

A) Input Validation & Sanitization
B) Encryption (at rest, in transit, application-level)
C) Rate Limiting & Throttling
D) Testing Strategies (unit, integration, e2e, contract, property-based)
E) Code Quality (linting, formatting, static analysis patterns)
F) Performance Optimization (caching strategies, lazy loading, pagination)
G) Accessibility Standards
H) All of the above
X) Other (please describe after [Answer]: tag below)

[Answer]: H

## Question 9
Which of these INTEGRATION & DATA domains should be included? (Select ALL that apply by listing letters)

A) Third-Party API Integration patterns
B) Webhook Design & Consumption
C) File Upload/Download & Storage patterns
D) Search Implementation (full-text, faceted, real-time)
E) Data Transformation & ETL patterns
F) Versioning Strategies (API versioning, schema versioning, backward compatibility)
G) All of the above
X) Other (please describe after [Answer]: tag below)

[Answer]: G

## Question 10
Are there any domains I MISSED that you specifically want included?

A) No, the above covers what I need
B) Yes (please list them after [Answer]: tag below)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## SECTION 3: DISTRIBUTION & CONSUMPTION MODEL

## Question 11
How should this cookbook be consumed by AI assistants?

A) As a Skills package (like the `.agents/skills/` pattern — individual ai-architecture-cookbook.md files per topic)
B) As an MCP server (Model Context Protocol — tools the AI can call to query standards)
C) As prompt/instruction files (`.github/copilot-instructions.md`, `CLAUDE.md`, `.cursorrules`, etc.)
D) As a raw reference repo (AI assistants clone/read the YAML files directly)
E) All of the above — support multiple consumption methods
X) Other (please describe after [Answer]: tag below)

[Answer]: E, All of the above — support multiple consumption methods

## Question 12
Should the cookbook include technology-specific variants or remain technology-agnostic?

A) Technology-agnostic only — describe patterns abstractly (e.g., "use a circuit breaker" without specifying Polly vs Resilience4j)
B) Agnostic core with tech-specific implementation notes for popular stacks (Node.js, Python, Java, .NET, Go, Rust)
C) Fully tech-specific — separate entries per technology stack
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 13
Should the cookbook include "prompt recipes" (reusable prompts an AI can use to implement standards)?

A) Yes, every standard should include prompt recipes (like the existing authentication.yaml does)
B) Yes, but only for complex standards that benefit from guided implementation
C) No, the decision tree and checklist are sufficient
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## SECTION 4: GOVERNANCE & EVOLUTION

## Question 14
How should the cookbook handle conflicting standards (e.g., REST vs GraphQL)?

A) Present both as valid choices with a decision tree to pick the right one for a given context
B) Recommend one as default and present others as alternatives
C) Keep them as completely separate, independent entries with no cross-reference
X) Other (please describe after [Answer]: tag below)

[Answer]: A, Present both as valid choices with a decision tree to pick the right one for a given context

## Question 15
What maturity/quality bar should each cookbook entry meet before publishing?

A) Community-reviewed — follow a PR review process
B) Self-published — author validates against the base template
C) Tiered — core entries reviewed, community contributions self-validated
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 16
Should the repo include a contribution guide and standard for community contributions?

A) Yes — detailed CONTRIBUTING.md with template validation, PR checklist
B) Minimal — basic CONTRIBUTING.md with pointers to the template
C) Not now — focus on core content first, add contribution guide later
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## SECTION 5: EXTENSIONS & PRIORITIES

## Question: Security Extensions
Should security extension rules be enforced for this project?

A) Yes — enforce all SECURITY rules as blocking constraints (recommended for production-grade applications)
B) No — skip all SECURITY rules (suitable for PoCs, prototypes, and experimental projects)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question: Property-Based Testing Extension
Should property-based testing (PBT) rules be enforced for this project?

A) Yes — enforce all PBT rules as blocking constraints (recommended for projects with business logic, data transformations, serialization, or stateful components)
B) Partial — enforce PBT rules only for pure functions and serialization round-trips (suitable for projects with limited algorithmic complexity)
C) No — skip all PBT rules (suitable for simple CRUD applications, UI-only projects, or thin integration layers with no significant business logic)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 17
What are your TOP 5 priority standards to build first (after authentication)?

A) Let me pick from the domains above (list your top 5 after [Answer]: tag)
B) You recommend the top 5 based on universal importance and I'll approve
C) Start with the most foundational ones and work outward (you decide the order)
X) Other (please describe after [Answer]: tag below)

[Answer]: C

---
