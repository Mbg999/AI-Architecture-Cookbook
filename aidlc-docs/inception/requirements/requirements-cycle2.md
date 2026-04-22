# Requirements: AI Architecture Cookbook — Cycle 2 (New Standards)

## Intent Analysis

- **User Request**: Add new architectural standards and best practices for client-platform security (web, mobile, desktop — SSL, pinning, root device prevention), plus additional security, resilience, and delivery standards, plus security monitoring for threat detection.
- **Request Type**: Enhancement (brownfield — adding 10 new standards to existing 33-standard catalog)
- **Scope Estimate**: Multiple Components — 10 new YAML standard entries across 4 categories, plus index/MCP/validation updates
- **Complexity Estimate**: Complex — 10 enterprise-grade standards, each with full decision trees, 4+ patterns, security hardening, checklists, and compliance mapping

---

## Functional Requirements

### FR-C2-01: New Standard Entries (10 Total)

Each new standard MUST follow `base-template.yaml` v3 schema and match the quality bar of the existing 33 standards: full decision trees, 4+ patterns, code examples (technology-agnostic), security hardening, anti-patterns (≥3), checklist items (≥4), prompt recipes (≥4), and compliance mappings.

#### Group A: Security Standards (in `security-quality/`)

**1. Client-Platform Security** (`security-quality/client-platform-security/`)
- Domain: `client-platform-security`
- Covers all three platforms: **Web**, **Mobile (iOS/Android)**, and **Desktop**
- Topics: SSL/TLS hardening, certificate pinning, root/jailbreak detection, secure local storage, code obfuscation, anti-tampering, WebView security, deep link validation
- Platform-specific decision tree branches for web vs. mobile vs. desktop
- Web: CSP, CORS, XSS/CSRF mitigation, SRI, secure cookies, iframe sandboxing
- Mobile: cert pinning, root/jailbreak detection, secure enclave/keychain, app integrity checks, binary protection
- Desktop: code signing, auto-update security, IPC hardening, memory protection, anti-debugging

**2. Secure SDLC** (`security-quality/secure-sdlc/`)
- Domain: `secure-sdlc`
- SAST/DAST/SCA tool integration patterns
- Dependency scanning and vulnerability management
- Supply chain security (signed commits, signed artifacts, SBOM generation)
- Security gates in CI/CD pipelines
- Threat modeling integration

**3. Compliance & Data Privacy** (`security-quality/compliance-data-privacy/`)
- Domain: `compliance-data-privacy`
- GDPR, CCPA, HIPAA, SOC 2 patterns
- PII identification, classification, and handling
- Consent management and preference centers
- Data retention, deletion, and right-to-be-forgotten
- Data residency and cross-border transfer
- Audit trails for compliance

**4. Security Monitoring & Threat Detection** (`security-quality/security-monitoring/`)
- Domain: `security-monitoring`
- Anomalous access pattern detection
- Failed login attempt monitoring and alerting
- Privilege escalation detection
- SIEM integration patterns
- Security event correlation and response
- Runtime application self-protection (RASP) patterns
- Honeypot and canary token strategies

#### Group B: Foundational Standards (in `foundational/`)

**5. Authorization** (`foundational/authorization/`)
- Domain: `authorization`
- RBAC, ABAC, ReBAC, and PBAC models
- Policy engine patterns (OPA, Cedar, Casbin-style)
- Permission hierarchy and inheritance
- Resource-level vs. action-level authorization
- Multi-tenant authorization isolation
- Prerequisite: `authentication`

**6. Session Management** (`foundational/session-management/`)
- Domain: `session-management`
- Session lifecycle (creation, renewal, termination)
- Token refresh strategies (sliding window, absolute expiry)
- Concurrent session control and device management
- Session fixation and hijacking prevention
- Distributed session stores and replication
- Prerequisite: `authentication`

**7. Secrets Management** (`foundational/secrets-management/`)
- Domain: `secrets-management`
- Vault patterns (HashiCorp Vault, cloud-native vaults)
- Secret rotation strategies (automatic, zero-downtime)
- Runtime secret injection (sidecar, init container, env)
- Envelope encryption and key hierarchies
- Zero-trust secret access and least-privilege policies
- Related: `configuration-management`, `encryption`

#### Group C: Application Architecture Standards (in `application-architecture/`)

**8. Resilience & Chaos Engineering** (`application-architecture/resilience-chaos-engineering/`)
- Domain: `resilience-chaos-engineering`
- Failure injection patterns (network, service, resource)
- Game day planning and execution
- Blast radius containment (bulkheads, cell-based architecture)
- Graceful degradation and fallback hierarchies
- Steady-state hypothesis and experiment design
- Related: `error-handling`

**9. Feature Flags & Progressive Delivery** (`application-architecture/feature-flags/`)
- Domain: `feature-flags`
- Feature toggle types (release, experiment, ops, permission)
- Canary releases and progressive rollout
- A/B testing and multivariate experiments
- Kill switches and circuit-breaker flags
- Flag lifecycle management (creation → rollout → cleanup)
- Technical debt from stale flags
- Related: `ci-cd`, `configuration-management`

#### Group D: Infrastructure Standards (in `infrastructure/`)

**10. API Gateway & Edge Security** (`infrastructure/api-gateway-edge-security/`)
- Domain: `api-gateway-edge-security`
- WAF rule patterns and OWASP Core Rule Set
- Bot detection and mitigation
- DDoS protection at edge layer
- API key management and request signing
- Edge-level rate limiting and geo-blocking
- Gateway routing, transformation, and aggregation
- Related: `api-design`, `rate-limiting`

---

### FR-C2-02: Category Placement (Mix Strategy)

| Standard | Category | Rationale |
|----------|----------|-----------|
| client-platform-security | security-quality | Primary focus is security |
| secure-sdlc | security-quality | Development security practices |
| compliance-data-privacy | security-quality | Privacy and compliance concerns |
| security-monitoring | security-quality | Security operations |
| authorization | foundational | Core cross-cutting concern like authentication |
| session-management | foundational | Core session lifecycle, used by all apps |
| secrets-management | foundational | Cross-cutting infrastructure concern |
| resilience-chaos-engineering | application-architecture | Architectural resilience patterns |
| feature-flags | application-architecture | Application delivery patterns |
| api-gateway-edge-security | infrastructure | Edge/network infrastructure |

### FR-C2-03: Cross-References to Existing Standards

New standards MUST declare `prerequisites` and `related_standards` linking to existing entries:
- `authorization` → prereq: `authentication`
- `session-management` → prereq: `authentication`
- `secrets-management` → related: `configuration-management`, `encryption`
- `resilience-chaos-engineering` → related: `error-handling`
- `feature-flags` → related: `ci-cd`, `configuration-management`
- `api-gateway-edge-security` → related: `api-design`, `rate-limiting`
- `client-platform-security` → related: `encryption`, `authentication`
- `secure-sdlc` → related: `code-quality`, `testing-strategies`
- `compliance-data-privacy` → related: `encryption`, `logging-observability`
- `security-monitoring` → related: `logging-observability`, `authentication`

### FR-C2-04: Index and Infrastructure Updates

After all 10 standards are created:
- Update `index.yaml` to include all 10 new entries (total: 43 standards)
- Update each affected category's `_index.yaml`
- Ensure MCP server loads new entries (no code changes needed — dynamic loader)
- Ensure `tools/validate.py` passes for all 43 entries
- Update `README.md` catalog tables

### FR-C2-05: Implementation Order

All 10 standards implemented in parallel batches (user preference: B).
Batch by category for efficiency:
- **Batch 1**: `security-quality/` — client-platform-security, secure-sdlc, compliance-data-privacy, security-monitoring (4 standards)
- **Batch 2**: `foundational/` — authorization, session-management, secrets-management (3 standards)
- **Batch 3**: `application-architecture/` — resilience-chaos-engineering, feature-flags (2 standards)
- **Batch 4**: `infrastructure/` — api-gateway-edge-security (1 standard)
- **Batch 5**: Index, README, validation updates

---

## Non-Functional Requirements

### NFR-C2-01: Consistency with Existing Standards
- All new entries MUST use identical YAML structure to existing 33 standards
- Schema version MUST be 3 (`schema_version: 3`)
- Technology-agnostic content only (pseudocode/conceptual, no Swift/Kotlin/etc.)
- Same quality bar: ≥4 patterns, ≥3 anti-patterns, ≥1 correct+incorrect example, ≥4 prompt recipes, ≥4 checklist items

### NFR-C2-02: Enterprise-Grade Depth
- Full decision trees with priority-ordered rules and fallback patterns
- Decision metadata with confidence levels and risk assessments
- Comprehensive security hardening sections (6 categories where applicable)
- Compliance mappings to relevant standards (OWASP, NIST, ISO 27001, CIS, etc.)

### NFR-C2-03: Validation Compliance
- All 10 new standards MUST pass `python3 tools/validate.py`
- JSON Schema compliance (structure, types, enums)
- Cross-reference integrity (all prerequisites and related_standards must exist)
- Completeness checks (minimum patterns, anti-patterns, examples, recipes)
- Index consistency (all entry paths resolve)

### NFR-C2-04: Extension Enforcement
- **Security Baseline**: Enforced (Yes) — all new standards reviewed against security baseline rules
- **Property-Based Testing**: Enforced (Yes, Full) — PBT patterns included in checklist items where applicable

---

## Updated Standard Count

| Category | Existing | New | Total |
|----------|----------|-----|-------|
| foundational | 8 | 3 | 11 |
| application-architecture | 7 | 2 | 9 |
| infrastructure | 6 | 1 | 7 |
| security-quality | 6 | 4 | 10 |
| integration-data | 6 | 0 | 6 |
| **Total** | **33** | **10** | **43** |

---
