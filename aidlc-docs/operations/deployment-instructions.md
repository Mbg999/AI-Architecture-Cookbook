# Deployment & Rollback Instructions

Purpose
- Provide safe deployment, verification, and rollback steps for services.
- Scope: CI/CD handoff, deployment verification, and rollback triggers.

Basic Steps
- Deploy to staging; run smoke tests and canary traffic.
- Promote to production with gradual rollout (canary/blue-green).
- Monitor SLOs during rollout; halt if critical thresholds hit.
- Rollback procedure: trigger automated rollback or manual rollback playbook.

Verification
- Smoke tests, end-to-end checks, and SLO monitoring during rollout.

---
