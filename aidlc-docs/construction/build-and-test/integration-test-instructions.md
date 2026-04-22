# Integration Test Instructions

## Purpose

Verify that the distribution channels correctly consume cookbook entries — the MCP server loads and queries YAML files, compose.py reads entries and generates instruction files, and the index system is consistent with the actual entries on disk.

## Test Scenarios

### Scenario 1: MCP Server Loads All Entries

The MCP server's `CookbookLoader` must discover and parse all 33 entries from disk.

```bash
cd mcp-server
node --input-type=module -e "
import { CookbookLoader } from './dist/loader.js';
const loader = new CookbookLoader(process.cwd() + '/..');
const idx = loader.getIndex();
console.log('Total entries:', idx.total_entries);
console.log('Categories:', idx.categories.length);
console.log('Tags:', Object.keys(idx.tag_index).length);
const domains = loader.getAllDomains();
console.log('Domains loaded:', domains.length);
if (domains.length !== 33) {
  console.error('FAIL: Expected 33 domains, got', domains.length);
  process.exit(1);
}
console.log('PASS: All 33 domains loaded');
"
```

**Expected**: `Total entries: 33`, `PASS: All 33 domains loaded`

### Scenario 2: MCP Server Query + Search

```bash
cd mcp-server
node --input-type=module -e "
import { CookbookLoader } from './dist/loader.js';
const loader = new CookbookLoader(process.cwd() + '/..');

// Query a specific standard
const auth = loader.getEntry('authentication');
if (!auth) { console.error('FAIL: authentication not found'); process.exit(1); }
console.log('query_standard(authentication):', auth.meta.version);

// Search by tags
const secResults = loader.searchByTags(['security']);
console.log('search_standards(tags=[security]):', secResults.length, 'results');
if (secResults.length < 3) { console.error('FAIL: Expected ≥3 security results'); process.exit(1); }

// Search by query
const apiResults = loader.searchByQuery('api');
console.log('search_standards(query=api):', apiResults.length, 'results');
if (apiResults.length < 2) { console.error('FAIL: Expected ≥2 api results'); process.exit(1); }

console.log('PASS: Query and search work correctly');
"
```

### Scenario 3: Decision Tree Evaluation

```bash
cd mcp-server
node --input-type=module -e "
import { CookbookLoader } from './dist/loader.js';
import { buildRecommendation } from './dist/evaluator.js';
const loader = new CookbookLoader(process.cwd() + '/..');

const auth = loader.getEntry('authentication');
const rec = buildRecommendation(auth, { client_types: 'web', needs_login: true });
console.log('recommend_pattern(auth, web+login):', rec.pattern, '(node:', rec.matched_node + ')');
if (!rec.pattern) { console.error('FAIL: No pattern recommended'); process.exit(1); }
console.log('PASS: Decision tree evaluation works');
"
```

### Scenario 4: Compose.py Full Pipeline

```bash
# Generate all 4 formats
for fmt in copilot claude cursor generic; do
  python3 prompts/compose.py --format $fmt --standards all --output /tmp/test-$fmt.md 2>&1
done

# Verify all outputs exist and are non-empty
for fmt in copilot claude cursor generic; do
  size=$(wc -c < /tmp/test-$fmt.md)
  if [ "$size" -lt 1000 ]; then
    echo "FAIL: $fmt output too small ($size bytes)"
    exit 1
  fi
  echo "PASS: $fmt format generated ($size bytes)"
done
```

### Scenario 5: Index Consistency

```bash
python3 -c "
import yaml, os

# Load root index
with open('index.yaml') as f:
    idx = yaml.safe_load(f)

# Verify every entry path exists
missing = []
for cat in idx['categories']:
    for entry in cat['entries']:
        if not os.path.isfile(entry['path']):
            missing.append(entry['path'])

if missing:
    print('FAIL: Missing files:', missing)
    exit(1)

print(f'PASS: All {idx[\"total_entries\"]} entry paths resolve')
"
```

## Integration Test Summary

| Scenario | Description | Dependency |
|----------|-------------|------------|
| MCP Loader | All 33 entries load from disk | Node.js + built MCP server |
| MCP Query/Search | Standard retrieval and tag search | MCP server + YAML files |
| Decision Tree | Evaluator returns valid recommendations | MCP server + evaluator |
| Compose Pipeline | All 4 formats generate valid output | Python + YAML files |
| Index Consistency | Root index paths match filesystem | Python + index.yaml |
