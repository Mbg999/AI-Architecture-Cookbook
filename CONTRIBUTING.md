# Contributing to AI Architecture Cookbook

Thank you for your interest in contributing! This guide covers how to add new standards, improve existing ones, and ensure quality.

## Quick Start

1. Fork and clone the repository
2. Create a branch: `git checkout -b feat/my-standard`
3. Make changes following the guidelines below
4. Run validation: `python3 tools/validate.py`
5. Submit a pull request

## Types of Contributions

### Adding a New Standard

1. **Choose the right category**: foundational, application-architecture, infrastructure, security-quality, or integration-data
2. **Create the directory**: `{category}/{domain}/{domain}.yaml`
3. **Use the schema**: Copy `base-template.yaml` and fill in all sections
4. **Update the category index**: Add your entry to `{category}/_index.yaml`
5. **Run validation**: `python3 tools/validate.py`

### Quality Gates (mandatory)

Every entry must meet these minimums:

| Requirement | Minimum |
|-------------|---------|
| Patterns | ≥ 3 |
| Anti-patterns | ≥ 3 |
| Examples (correct + incorrect) | ≥ 1 |
| Prompt recipes | ≥ 4 |
| Checklist items | ≥ 4 |
| Security hardening categories | All 6 filled |

### Schema Compliance

All entries must validate against `tools/schema.json` (schema v3). Key rules:

- `meta.schema_version` must be `3`
- `meta.version` follows semver (e.g., `"1.0.0"`)
- `meta.domain` must be kebab-case and match the filename
- Checklist IDs follow `^[A-Z]+-\d+$` (e.g., `AUTH-01`, `API-03`)
- `prompt_recipes[].scenario` must use allowed enum values
- All `decision_tree` priorities must be contiguous starting at 1

### Improving an Existing Standard

1. **Bump the version**: Update `meta.version` (patch for fixes, minor for new patterns)
2. **Update `meta.last_updated`**: Set to current date
3. **Keep backward compatibility**: Don't remove patterns that may be referenced

## Entry Structure

```yaml
meta:               # Domain metadata, tags, prerequisites, related standards
context_inputs:     # Parameters for decision tree evaluation
decision_tree:      # Priority-ordered if/then/else rules
decision_metadata:  # Confidence, risk, fallback pattern
patterns:           # Implementation details with code and common errors
examples:           # Correct and incorrect code examples
security_hardening: # 6 categories: transport, data_protection, access_control,
                    # input_output, secrets, monitoring
compliance:         # Standards references and requirements mapping
prompt_recipes:     # Pre-built prompts for common scenarios
anti_patterns:      # What to avoid with detection and migration guidance
checklist:          # Verification items with severity and verification method
```

## Decision Tree Conditions

Use these operators in `decision_tree[].if` conditions:

| Operator | Example |
|----------|---------|
| `==` | `client_types == web` |
| `!=` | `auth_type != none` |
| `in` | `protocol in [rest, graphql]` |
| `not_in` | `env not_in [development]` |
| `>`, `<`, `>=`, `<=` | `team_size > 5` |

Multiple conditions in the same `if` array are ANDed together.

## Cross-References

- **prerequisites**: List domains this standard depends on (string or `{id, reason}` format)
- **related_standards**: Link to related entries with relationship type (`alternative`, `complementary`, `superset`, `subset`)
- All cross-references must resolve to existing entries

## Validation

Run the full validation suite before submitting:

```bash
python3 tools/validate.py
```

This checks:
- JSON Schema compliance (structure, types, enums)
- Semantic integrity (cross-references, completeness, ID uniqueness)
- Index consistency (_index.yaml matches actual files)

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat(domain): add new standard` — new entry
- `fix(domain): correct pattern implementation` — fix in existing entry
- `docs: update README` — documentation only
- `chore: update validation tooling` — tooling changes

## Code of Conduct

Be respectful, constructive, and focused on improving architectural standards for the AI community.
