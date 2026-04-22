# Code Generation Plan — Batch 2: Application Architecture Standards

## Unit Context
- **Unit**: U2 (Application Architecture Standards)
- **Batch**: 2
- **Approval Model**: Auto-generate all (Q2=C) — review at end of all batches
- **Reference**: foundational/authentication/authentication.yaml (v2.0.0, schema v3)

## Dependencies
- U0 (base-template.yaml v3) — COMPLETE
- U1 (Foundational Standards) — COMPLETE
- U1-V (Validation Tooling) — COMPLETE

---

## Generation Steps

- [x] **Step 1**: Create `application-architecture/_index.yaml` (category metadata)
- [x] **Step 2**: Generate `application-architecture/layered-architecture/layered-architecture.yaml`
- [x] **Step 3**: Generate `application-architecture/service-architecture/service-architecture.yaml`
- [x] **Step 4**: Generate `application-architecture/domain-driven-design/domain-driven-design.yaml`
- [x] **Step 5**: Generate `application-architecture/state-management/state-management.yaml`
- [x] **Step 6**: Generate `application-architecture/dependency-injection/dependency-injection.yaml`
- [x] **Step 7**: Generate `application-architecture/repository-pattern/repository-pattern.yaml`
- [x] **Step 8**: Generate `application-architecture/design-patterns/design-patterns.yaml`
- [x] **Step 9**: Run validation on all application-architecture entries

## Quality Gates (per entry)
- ≥3 patterns, ≥3 anti-patterns, ≥1 example, ≥4 prompt recipes
- All required v3 fields populated
- related_standards cross-references to existing entries
- Structured security_hardening (6 categories)
- Structured checklist with id, category, severity, verified_by
