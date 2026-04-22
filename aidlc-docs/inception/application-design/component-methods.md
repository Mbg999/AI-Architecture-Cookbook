# Component Methods — AI Architecture Cookbook

## C2: Index System — Data Structures

### index.yaml (Global Index)

```yaml
schema_version: 1
name: "AI Architecture Cookbook"
description: "Architectural standards for AI code assistants"
total_entries: 33

categories:
  - id: foundational
    name: "Foundational Standards"
    description: "Core cross-cutting concerns every system needs"
    path: "foundational/"
    entry_count: 7
    entries:
      - domain: "authentication"
        path: "foundational/authentication/authentication.yaml"
        version: "2.0.0"
        description: "Authentication and authorization patterns"
        tags: ["security", "identity", "access-control"]
        prerequisites: []
      # ... repeat for each entry

  - id: application-architecture
    name: "Application Architecture"
    description: "Structural and design patterns for applications"
    path: "application-architecture/"
    entry_count: 7
    entries: [...]

  - id: infrastructure
    name: "Infrastructure & Deployment"
    description: "Container, orchestration, CI/CD, and cloud patterns"
    path: "infrastructure/"
    entry_count: 6
    entries: [...]

  - id: security-quality
    name: "Security & Quality"
    description: "Security hardening, testing, and quality assurance"
    path: "security-quality/"
    entry_count: 6
    entries: [...]

  - id: integration-data
    name: "Integration & Data"
    description: "External integrations, data pipelines, and versioning"
    path: "integration-data/"
    entry_count: 6
    entries: [...]

tag_index:
  security: ["authentication", "encryption", "input-validation", "rate-limiting"]
  api: ["api-design", "webhooks", "versioning"]
  # ... complete tag-to-domain mapping
```

### _index.yaml (Per-Category Index)

```yaml
category: "foundational"
name: "Foundational Standards"
description: "Core cross-cutting concerns every system needs"

entries:
  - domain: "authentication"
    version: "2.0.0"
    description: "Authentication and authorization patterns"
    tags: ["security", "identity", "access-control"]
    prerequisites: []
    pattern_count: 5
    anti_pattern_count: 6
  # ... repeat for each entry in this category
```

---

## C4: MCP Server — Tool Signatures

### Tool 1: query_standard

```typescript
/**
 * Returns the full YAML content for a given architectural standard.
 * @param domain - Kebab-case domain identifier (e.g., "authentication")
 * @returns Full YAML content as string + parsed meta section
 */
tool query_standard(domain: string): {
  found: boolean;
  domain: string;
  category: string;
  version: string;
  content: string;        // Full YAML content
  meta: object;           // Parsed meta section
}
```

### Tool 2: search_standards

```typescript
/**
 * Search entries by tags, categories, or text query.
 * @param tags - Filter by tags (OR logic within tags)
 * @param categories - Filter by category IDs (OR logic)
 * @param query - Free-text search across domain, description, tags
 * @returns Matching entries metadata (not full content)
 */
tool search_standards(
  tags?: string[],
  categories?: string[],
  query?: string
): {
  results: Array<{
    domain: string;
    category: string;
    description: string;
    version: string;
    tags: string[];
    path: string;
    pattern_count: number;
  }>;
  total: number;
}
```

### Tool 3: get_checklist

```typescript
/**
 * Returns the structured checklist for a given standard.
 * @param domain - Kebab-case domain identifier
 * @param severity - Optional filter by severity (critical, high, medium, low)
 * @returns Structured checklist items
 */
tool get_checklist(
  domain: string,
  severity?: string
): {
  domain: string;
  items: Array<{
    id: string;
    description: string;
    category: string;
    severity: string;
    verified_by: string;
  }>;
  total: number;
}
```

### Tool 4: get_decision_tree

```typescript
/**
 * Returns the decision tree and metadata for a given standard.
 * @param domain - Kebab-case domain identifier
 * @returns Decision tree nodes + metadata (confidence, risk, fallback)
 */
tool get_decision_tree(domain: string): {
  domain: string;
  context_inputs: Array<{
    name: string;
    type: string;
    description: string;
    required: boolean;
    default: any;
    enum_values?: string[];
  }>;
  decision_tree: Array<{
    id: string;
    priority: number;
    if: string[];
    then: { pattern: string; standards: string[]; notes: string };
    else?: { pattern: string; notes: string };
  }>;
  decision_metadata: {
    confidence: string;
    risk_if_wrong: string;
    fallback: { pattern: string; description: string };
  };
}
```

### Tool 5: recommend_pattern

```typescript
/**
 * AI provides context inputs; server evaluates decision trees across
 * all relevant entries and returns recommended patterns.
 * @param context - Key-value pairs matching context_inputs from entries
 * @param domains - Optional: limit recommendation to specific domains
 * @returns Ranked recommendations with rationale
 */
tool recommend_pattern(
  context: Record<string, any>,
  domains?: string[]
): {
  recommendations: Array<{
    domain: string;
    pattern: string;
    pattern_name: string;
    confidence: string;
    matched_node: string;
    rationale: string;
    checklist_summary: { critical: number; high: number; total: number };
  }>;
  unmatched_domains: string[];  // Domains where no decision node matched
  fallbacks_used: string[];     // Domains that fell back to default
}
```

---

## C6: Prompt System — Composition Tool Interface

### compose.py

```
Usage: python prompts/compose.py [OPTIONS]

Options:
  --format     Target format: copilot | claude | cursor | generic
  --standards  Comma-separated domain list, or "all"
  --output     Output file path (default: stdout)
  --categories Include all standards from given categories

Examples:
  python prompts/compose.py --format copilot --standards all --output .github/copilot-instructions.md
  python prompts/compose.py --format claude --standards authentication,api-design --output CLAUDE.md
  python prompts/compose.py --format cursor --categories foundational,security-quality --output .cursorrules
```

### Module Format (prompts/modules/{domain}.md)

Each module is a self-contained instruction block that can be concatenated:

```markdown
<!-- MODULE: {domain} v{version} -->
## {Domain Name}

{Condensed instruction text derived from the YAML entry's patterns, decision tree, and checklist.
Optimized for instruction-file token budgets.}

### When to use
{Derived from decision_tree conditions}

### Default pattern
{Derived from decision_metadata.fallback}

### Checklist (critical items)
{Derived from checklist items where severity = critical or high}
<!-- END MODULE: {domain} -->
```

---

## C7: Validation System — Tool Interfaces

### tools/validate.py

```
Usage: python tools/validate.py [OPTIONS] [PATHS...]

Commands:
  schema     Validate YAML files against tools/schema.json
  semantic   Run semantic checks (cross-refs, enums, completeness)
  all        Run both schema + semantic validation
  index      Validate index.yaml and _index.yaml consistency

Options:
  --fix       Auto-fix simple issues (e.g., update _index.yaml entry counts)
  --verbose   Show passing checks too
  PATHS       Specific files to validate (default: all entries)

Exit codes:
  0  All validations passed
  1  Structural (schema) errors found
  2  Semantic errors found
  3  Both structural and semantic errors found
```

### Semantic Checks Performed

| Check | Description |
|-------|-------------|
| cross-ref-integrity | All `related_standards[].id` and `prerequisites[]` resolve to existing entries |
| tag-consistency | All tags used in entries appear in `index.yaml` tag_index |
| enum-values | All `context_inputs[].enum_values` are used in at least one `decision_tree` condition |
| index-sync | `index.yaml` and `_index.yaml` entry lists match actual files on disk |
| completeness | ≥3 patterns, ≥3 anti-patterns, ≥1 example, ≥4 prompt_recipes per entry |
| id-uniqueness | All IDs (pattern, checklist, example, decision) are unique within entry |
| priority-contiguous | Decision tree priorities are contiguous integers starting at 1 |
| version-format | `meta.version` follows semver; `meta.schema_version` == 3 |
