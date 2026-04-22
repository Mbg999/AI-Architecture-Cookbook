#!/usr/bin/env python3
"""
AI Architecture Cookbook — Entry Validator (v3 Schema)

Validates cookbook YAML entries against:
  1. JSON Schema (structural validation)
  2. Semantic rules (cross-references, completeness, consistency)

Usage:
  python validate.py                          # Validate all entries
  python validate.py foundational/            # Validate a category
  python validate.py foundational/api-design/api-design.yaml  # Validate one entry
"""

import datetime
import json
import sys
from pathlib import Path
from typing import Any

try:
    import yaml
except ImportError:
    sys.exit("ERROR: PyYAML not installed. Run: pip install pyyaml")

try:
    import jsonschema
    from jsonschema import Draft202012Validator
except ImportError:
    sys.exit("ERROR: jsonschema not installed. Run: pip install jsonschema")


# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
REPO_ROOT = Path(__file__).resolve().parent.parent
SCHEMA_PATH = Path(__file__).resolve().parent / "schema.json"

CATEGORY_DIRS = [
    "foundational",
    "application-architecture",
    "infrastructure",
    "security-quality",
    "integration-data",
]

SKIP_FILES = {"_index.yaml", "base-template.yaml"}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def load_schema() -> dict:
    with open(SCHEMA_PATH) as f:
        return json.load(f)


def load_yaml(path: Path) -> dict:
    with open(path) as f:
        data = yaml.safe_load(f)
    # PyYAML parses dates as datetime.date — convert to string for schema validation
    return _convert_dates(data) if data else data


def _convert_dates(obj: Any) -> Any:
    """Recursively convert datetime.date/datetime objects to ISO strings."""
    if isinstance(obj, (datetime.date, datetime.datetime)):
        return obj.isoformat()
    if isinstance(obj, dict):
        return {k: _convert_dates(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_convert_dates(item) for item in obj]
    return obj


def find_entries(target: str | None) -> list[Path]:
    """Find YAML entry files to validate."""
    entries: list[Path] = []

    if target:
        target_path = REPO_ROOT / target
        if target_path.is_file():
            return [target_path]
        if target_path.is_dir():
            return sorted(
                p
                for p in target_path.rglob("*.yaml")
                if p.name not in SKIP_FILES
            )

    for cat_dir in CATEGORY_DIRS:
        cat_path = REPO_ROOT / cat_dir
        if cat_path.exists():
            entries.extend(
                sorted(
                    p
                    for p in cat_path.rglob("*.yaml")
                    if p.name not in SKIP_FILES
                )
            )
    return entries


def relative(path: Path) -> str:
    return str(path.relative_to(REPO_ROOT))


# ---------------------------------------------------------------------------
# Schema validation
# ---------------------------------------------------------------------------
def validate_schema(entry: dict, schema: dict, path: Path) -> list[str]:
    """Validate entry against JSON Schema. Returns list of error messages."""
    errors: list[str] = []
    validator = Draft202012Validator(schema)
    for error in sorted(validator.iter_errors(entry), key=lambda e: list(e.path)):
        loc = ".".join(str(p) for p in error.absolute_path) or "(root)"
        errors.append(f"  SCHEMA [{loc}]: {error.message}")
    return errors


# ---------------------------------------------------------------------------
# Semantic validation
# ---------------------------------------------------------------------------
def validate_semantic(entry: dict, path: Path, all_domains: set[str]) -> tuple[list[str], list[str]]:
    """Validate semantic rules beyond what JSON Schema covers.
    Returns (errors, warnings)."""
    errors: list[str] = []
    warnings: list[str] = []
    meta = entry.get("meta", {})
    domain = meta.get("domain", "")

    # --- Quality gates ---
    patterns = entry.get("patterns", [])
    anti_patterns = entry.get("anti_patterns", [])
    examples = entry.get("examples", [])
    prompt_recipes = entry.get("prompt_recipes", [])
    checklist = entry.get("checklist", [])

    if len(patterns) < 3:
        errors.append(f"  QUALITY: {len(patterns)} patterns (minimum 3)")
    if len(anti_patterns) < 3:
        errors.append(f"  QUALITY: {len(anti_patterns)} anti-patterns (minimum 3)")
    if len(examples) < 1:
        errors.append(f"  QUALITY: {len(examples)} examples (minimum 1)")
    if len(prompt_recipes) < 4:
        errors.append(f"  QUALITY: {len(prompt_recipes)} prompt recipes (minimum 4)")

    # --- Cross-reference validation (warnings — referenced domains may be in future batches) ---
    # Check related_standards reference existing domains
    for rs in meta.get("related_standards", []):
        ref_id = rs.get("id", "")
        if ref_id and ref_id not in all_domains and ref_id != domain:
            warnings.append(
                f"  XREF: related_standard '{ref_id}' not found in known domains (future batch?)"
            )

    # Check prerequisites reference existing domains
    for prereq in meta.get("prerequisites", []):
        prereq_id = prereq.get("id", "") if isinstance(prereq, dict) else prereq
        if prereq_id and prereq_id not in all_domains:
            warnings.append(f"  XREF: prerequisite '{prereq_id}' not found in known domains (future batch?)")

    # --- Pattern ID consistency ---
    pattern_ids = {p.get("id") for p in patterns}

    # Decision tree references valid patterns
    for node in entry.get("decision_tree", []):
        then_pattern = node.get("then", {}).get("pattern", "")
        if then_pattern and then_pattern not in pattern_ids:
            errors.append(
                f"  CONSISTENCY: decision_tree node '{node.get('id')}' "
                f"references pattern '{then_pattern}' not defined in patterns"
            )
        else_block = node.get("else", {})
        if else_block:
            else_pattern = else_block.get("pattern", "")
            if else_pattern and else_pattern not in pattern_ids:
                errors.append(
                    f"  CONSISTENCY: decision_tree else references pattern "
                    f"'{else_pattern}' not defined in patterns"
                )

    # Fallback references valid pattern
    fallback_pattern = (
        entry.get("decision_metadata", {}).get("fallback", {}).get("pattern", "")
    )
    if fallback_pattern and fallback_pattern not in pattern_ids:
        errors.append(
            f"  CONSISTENCY: fallback pattern '{fallback_pattern}' not in patterns"
        )

    # Anti-pattern related_pattern references valid pattern
    for ap in anti_patterns:
        rp = ap.get("related_pattern", "")
        if rp and rp not in pattern_ids:
            errors.append(
                f"  CONSISTENCY: anti_pattern '{ap.get('name')}' references "
                f"pattern '{rp}' not defined in patterns"
            )

    # Checklist verified_by references valid pattern or anti-pattern name
    anti_pattern_names = {ap.get("name") for ap in anti_patterns}
    valid_verifiers = pattern_ids | anti_pattern_names
    for item in checklist:
        vb = item.get("verified_by", "")
        if vb and vb not in valid_verifiers:
            errors.append(
                f"  CONSISTENCY: checklist '{item.get('id')}' verified_by "
                f"'{vb}' not found in patterns or anti-patterns"
            )

    # --- Checklist ID uniqueness ---
    check_ids = [c.get("id") for c in checklist]
    seen: set[str] = set()
    for cid in check_ids:
        if cid in seen:
            errors.append(f"  CONSISTENCY: duplicate checklist id '{cid}'")
        seen.add(cid)

    # --- Decision tree priority uniqueness ---
    priorities = [n.get("priority") for n in entry.get("decision_tree", [])]
    if len(priorities) != len(set(priorities)):
        errors.append("  CONSISTENCY: duplicate priority values in decision_tree")

    # --- Context input names used in decision tree ---
    input_names = {ci.get("name") for ci in entry.get("context_inputs", [])}
    for node in entry.get("decision_tree", []):
        for condition in node.get("if", []):
            # Extract variable name from condition string
            # Handles: "var == val", "var in [...]", "var != val", etc.
            var_name = condition.strip().split()[0] if condition.strip() else ""
            if var_name and var_name not in input_names:
                errors.append(
                    f"  CONSISTENCY: decision_tree condition references "
                    f"'{var_name}' not in context_inputs"
                )

    return errors, warnings


# ---------------------------------------------------------------------------
# Index validation
# ---------------------------------------------------------------------------
def validate_index(cat_dir: Path, entry_domains: set[str]) -> list[str]:
    """Validate _index.yaml against actual entries in the category."""
    errors: list[str] = []
    index_path = cat_dir / "_index.yaml"
    if not index_path.exists():
        errors.append(f"  INDEX: Missing _index.yaml in {cat_dir.name}/")
        return errors

    index_data = load_yaml(index_path)
    if not index_data:
        errors.append(f"  INDEX: Empty _index.yaml in {cat_dir.name}/")
        return errors

    # Check entries listed in index exist as actual files
    listed_entries = set()
    for entry_item in index_data.get("entries", []):
        if isinstance(entry_item, str):
            entry_id = entry_item
        elif isinstance(entry_item, dict):
            entry_id = entry_item.get("domain", entry_item.get("id", ""))
        else:
            entry_id = ""
        if entry_id:
            listed_entries.add(entry_id)
        if entry_id not in entry_domains:
            errors.append(
                f"  INDEX: '{entry_id}' listed in _index.yaml but no "
                f"matching YAML entry found in {cat_dir.name}/"
            )

    # Check actual entries are listed in index
    for domain in entry_domains:
        if domain not in listed_entries:
            errors.append(
                f"  INDEX: '{domain}' exists as entry but not listed in "
                f"{cat_dir.name}/_index.yaml"
            )

    return errors


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main() -> int:
    target = sys.argv[1] if len(sys.argv) > 1 else None
    schema = load_schema()
    entries = find_entries(target)

    if not entries:
        print("No entries found to validate.")
        return 1

    # Collect all known domains for cross-reference checking
    all_domains: set[str] = set()
    loaded_entries: list[tuple[Path, dict]] = []

    for path in entries:
        try:
            entry = load_yaml(path)
            if entry and "meta" in entry:
                domain = entry["meta"].get("domain", "")
                if domain:
                    all_domains.add(domain)
                loaded_entries.append((path, entry))
        except Exception as e:
            print(f"FAIL {relative(path)}: YAML parse error: {e}")

    total = 0
    failed = 0
    all_errors: dict[str, list[str]] = {}
    all_warnings: dict[str, list[str]] = {}

    for path, entry in loaded_entries:
        total += 1
        errors: list[str] = []

        # Schema validation
        errors.extend(validate_schema(entry, schema, path))

        # Semantic validation
        sem_errors, sem_warnings = validate_semantic(entry, path, all_domains)
        errors.extend(sem_errors)

        if sem_warnings:
            all_warnings[relative(path)] = sem_warnings

        if errors:
            failed += 1
            all_errors[relative(path)] = errors

    # Index validation (per category)
    if not target or Path(target).is_dir():
        for cat_dir_name in CATEGORY_DIRS:
            cat_path = REPO_ROOT / cat_dir_name
            if cat_path.exists():
                cat_domains = set()
                for p, e in loaded_entries:
                    if cat_path in p.parents:
                        d = e.get("meta", {}).get("domain", "")
                        if d:
                            cat_domains.add(d)
                idx_errors = validate_index(cat_path, cat_domains)
                if idx_errors:
                    key = f"{cat_dir_name}/_index.yaml"
                    all_errors[key] = idx_errors

    # Report
    print(f"\n{'='*60}")
    print(f"AI Architecture Cookbook — Validation Report")
    print(f"{'='*60}")
    print(f"Entries validated: {total}")
    print(f"Passed: {total - failed}")
    print(f"Failed: {failed}")

    if all_warnings:
        print(f"\n{'─'*60}")
        print("WARNINGS (non-blocking):")
        for file_path, warns in sorted(all_warnings.items()):
            print(f"\n  {file_path}:")
            for w in warns:
                print(w)

    if all_errors:
        print(f"\n{'─'*60}")
        print("ERRORS (blocking):")
        for file_path, errs in sorted(all_errors.items()):
            print(f"\nFAIL {file_path}:")
            for e in errs:
                print(e)
        print(f"\n{'─'*60}")
        print(f"Total errors: {sum(len(e) for e in all_errors.values())}")
        print(f"Total warnings: {sum(len(w) for w in all_warnings.values())}")
        return 1

    total_warnings = sum(len(w) for w in all_warnings.values())
    print(f"\n✓ All entries valid. ({total_warnings} warnings)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
