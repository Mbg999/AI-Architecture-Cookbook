# Requirements Verification Questions — Cycle 2 (New Standards)

Please answer the following questions to help define the scope and priorities for new architectural standards.

**Context**: The cookbook currently has 33 standards across 5 categories. You've requested adding security for web/mobile/desktop (SSL, pinning, root device prevention) and other new standards. Below are questions to refine scope.

---

## Question 1
Which client-platform security topics should the new standard(s) cover?

A) All three platforms: Web, Mobile (iOS/Android), and Desktop — with platform-specific patterns (SSL/TLS hardening, certificate pinning, root/jailbreak detection, secure storage, code obfuscation, anti-tampering)
B) Web and Mobile only (desktop is out of scope)
C) Mobile only (SSL pinning, root detection, secure enclave, app integrity)
D) Web only (CSP, CORS, XSS/CSRF protection, SRI, secure cookies)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 2
Beyond client-platform security, which additional NEW standards would you like to include? (Select all that apply by listing letters, e.g., "A, C, E")

A) **Authorization & RBAC** — Role-based / attribute-based / policy-based access control (RBAC, ABAC, ReBAC), permission models, policy engines (OPA, Cedar)
B) **Session Management** — Session lifecycle, token refresh, concurrent sessions, session fixation prevention, secure cookie management
C) **Secrets Management** — Vault patterns, secret rotation, runtime injection, zero-trust secret access, envelope encryption
D) **Secure SDLC** — SAST/DAST/SCA integration, dependency scanning, supply chain security, SBOM, signed artifacts
E) **Compliance & Data Privacy** — GDPR, CCPA, data residency, PII handling, consent management, data retention/deletion policies
F) **Resilience & Chaos Engineering** — Failure injection, game days, blast radius containment, graceful degradation patterns
G) **API Gateway & Edge Security** — WAF rules, bot detection, DDoS mitigation, API key management, request signing
H) **Feature Flags & Progressive Delivery** — Feature toggles, canary releases, A/B testing, kill switches, flag lifecycle management
I) All of the above
J) None of the above — only client-platform security
X) Other (please describe after [Answer]: tag below)

[Answer]: I, something about logs and monitoring for security events (e.g., detecting anomalous access patterns, failed login attempts, privilege escalation) will be fine to add to the list

---

## Question 3
For the client-platform security standard, what level of detail do you expect?

A) Full treatment — comprehensive decision trees, 4+ patterns per platform, code examples, security hardening, anti-patterns, checklists (same depth as existing 33 standards)
B) Standard treatment — decision trees and patterns but fewer code examples (3 patterns minimum)
C) Lightweight — decision tree and checklist only, minimal patterns
X) Other (please describe after [Answer]: tag below)

[Answer]: A, we look for enterprise level

---

## Question 4
Should the new standards be placed in existing categories or should we create a new category?

A) Place them in existing categories (e.g., client-platform-security under `security-quality/`, authorization under `foundational/`, etc.)
B) Create a new top-level category like `advanced-security/` for all the new security-focused standards
C) Mix — security standards in `security-quality/`, non-security standards in their natural categories
X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 5
What priority ordering should we use for implementation if we're adding multiple standards?

A) Client-platform security first (your explicit request), then the rest in logical dependency order
B) All standards in parallel (batch them all together)
C) Let me pick the order after seeing the full list
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 6
Should the new standards include platform-specific code examples (Swift/Kotlin/JS/Electron) or remain technology-agnostic with pseudocode only (matching the existing 33 standards)?

A) Technology-agnostic only (consistent with existing standards — pseudocode/conceptual examples)
B) Include platform-specific code examples where they add critical value (e.g., iOS certificate pinning in Swift, Android root detection in Kotlin)
C) Full platform-specific examples for every pattern
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 7
The previous cycle extensions are still active: **Security Baseline** (Yes) and **Property-Based Testing** (Yes, Full). Should these continue to apply to the new standards?

A) Yes — keep both extensions enforced for the new standards
B) Keep Security Baseline only, relax PBT for new standards
C) Re-evaluate both — let me decide after seeing the plan
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

**Instructions**: Please fill in the `[Answer]:` fields above. You can use letter choices (e.g., `A`) or for Question 2, list multiple letters (e.g., `A, C, E`). For any `X` choice, add your custom description after the tag.
