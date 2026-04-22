## Description

<!-- Brief description of changes -->

## Type of Change

- [ ] New standard (new YAML entry)
- [ ] Standard update (modified existing entry)
- [ ] Distribution (MCP server, skills, prompts)
- [ ] Tooling (validation, CI)
- [ ] Documentation

## Standard Entry Checklist

If adding or modifying a standard entry:

- [ ] `meta.schema_version` is `3`
- [ ] `meta.version` follows semver
- [ ] `meta.domain` matches filename (kebab-case)
- [ ] `meta.last_updated` is current date
- [ ] ≥ 3 patterns with implementation details
- [ ] ≥ 3 anti-patterns with detection and migration
- [ ] ≥ 1 example (correct + incorrect)
- [ ] ≥ 4 prompt recipes covering different scenarios
- [ ] All 6 security_hardening categories addressed
- [ ] Checklist IDs follow `^[A-Z]+-\d+$` pattern
- [ ] Category `_index.yaml` updated
- [ ] Cross-references resolve to existing entries

## Validation

- [ ] `python3 tools/validate.py` passes with 0 errors
- [ ] No new warnings introduced

## Notes

<!-- Any additional context for reviewers -->
