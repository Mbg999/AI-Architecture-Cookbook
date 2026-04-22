# Code Generation Plan — Batch 1: Foundational Standards + Validation Tooling

## Unit Context
- **Units**: U1 (Foundational Standards) + U1-V (Validation Tooling)
- **Batch**: 1
- **Approval Model**: Auto-generate all (Q2=C) — review at end of all batches
- **Reference**: foundational/authentication/authentication.yaml (v2.0.0, schema v3)

## Dependencies
- U0 (base-template.yaml v3 + authentication.yaml) — COMPLETE
- No upstream content dependencies (first content batch)

---

## Generation Steps

- [x] **Step 1**: Create `foundational/_index.yaml` (category metadata)
- [x] **Step 2**: Generate `foundational/api-design/api-design.yaml`
- [x] **Step 3**: Generate `foundational/error-handling/error-handling.yaml`
- [x] **Step 4**: Generate `foundational/logging-observability/logging-observability.yaml`
- [x] **Step 5**: Generate `foundational/data-persistence/data-persistence.yaml`
- [x] **Step 6**: Generate `foundational/input-validation/input-validation.yaml`
- [x] **Step 7**: Generate `foundational/messaging-events/messaging-events.yaml`
- [x] **Step 8**: Generate `foundational/configuration-management/configuration-management.yaml`
- [x] **Step 9**: Generate `tools/schema.json` (JSON Schema for v3)
- [x] **Step 10**: Generate `tools/validate.py` (schema + semantic validation)
- [x] **Step 11**: Run validation on all foundational entries

## Quality Gates (per entry)
- ≥3 patterns, ≥3 anti-patterns, ≥1 example, ≥4 prompt recipes
- All required v3 fields populated
- related_standards cross-references to existing entries
- Structured security_hardening (6 categories)
- Structured checklist with id, category, severity, verified_by
