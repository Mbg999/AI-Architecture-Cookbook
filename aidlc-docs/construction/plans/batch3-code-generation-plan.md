# Code Generation Plan — Batch 3: Infrastructure & Deployment Standards

## Unit Context
- **Unit**: U3 (Infrastructure & Deployment Standards)
- **Batch**: 3
- **Approval Model**: Auto-generate all (Q2=C) — review at end of all batches
- **Reference**: foundational/authentication/authentication.yaml (v2.0.0, schema v3)

## Dependencies
- U0 (base-template.yaml v3) — COMPLETE
- U1 (Foundational Standards) — COMPLETE
- U1-V (Validation Tooling) — COMPLETE
- U2 (Application Architecture) — COMPLETE

---

## Generation Steps

- [x] **Step 1**: Create `infrastructure/_index.yaml` (category metadata)
- [x] **Step 2**: Generate `infrastructure/containerization/containerization.yaml`
- [x] **Step 3**: Generate `infrastructure/orchestration/orchestration.yaml`
- [x] **Step 4**: Generate `infrastructure/ci-cd/ci-cd.yaml`
- [x] **Step 5**: Generate `infrastructure/infrastructure-as-code/infrastructure-as-code.yaml`
- [x] **Step 6**: Generate `infrastructure/cloud-architecture/cloud-architecture.yaml`
- [x] **Step 7**: Generate `infrastructure/database-migration/database-migration.yaml`
- [x] **Step 8**: Run validation on all infrastructure entries

## Quality Gates (per entry)
- ≥3 patterns, ≥3 anti-patterns, ≥1 example, ≥4 prompt recipes
- All required v3 fields populated
