import assert from "node:assert/strict";
import { CookbookLoader } from "../src/loader.js";
import { resolve } from "node:path";

const REPO_ROOT = resolve(import.meta.dirname, "../..");
const loader = new CookbookLoader(REPO_ROOT);

export default {
  "loads all 33 domains": async () => {
    const domains = loader.getAllDomains();
    assert.equal(domains.length, 33, `Expected 33 domains, got ${domains.length}`);
  },

  "getIndex returns valid structure": async () => {
    const idx = loader.getIndex();
    assert.equal(idx.schema_version, 1);
    assert.equal(idx.categories.length, 5);
    assert.equal(idx.total_entries, 33);
    assert.ok(Object.keys(idx.tag_index).length >= 50, "Expected ≥50 tags in tag_index");
  },

  "getEntry returns authentication": async () => {
    const auth = loader.getEntry("authentication");
    assert.ok(auth, "authentication entry should exist");
    assert.equal(auth!.meta.domain, "authentication");
    assert.ok(auth!.patterns.length >= 3, "Expected ≥3 patterns");
    assert.ok(auth!.checklist.length >= 1, "Expected ≥1 checklist item");
  },

  "getEntry returns null for unknown domain": async () => {
    const result = loader.getEntry("nonexistent-domain");
    assert.equal(result, null);
  },

  "searchByTags finds security entries": async () => {
    const results = loader.searchByTags(["security"]);
    assert.ok(results.length >= 3, `Expected ≥3 security results, got ${results.length}`);
    const domains = results.map((r) => r.domain);
    assert.ok(domains.includes("authentication"), "security tag should include authentication");
  },

  "searchByCategory finds foundational": async () => {
    const results = loader.searchByCategory(["foundational"]);
    assert.equal(results.length, 8, `Expected 8 foundational entries, got ${results.length}`);
  },

  "searchByQuery finds api entries": async () => {
    const results = loader.searchByQuery("api");
    assert.ok(results.length >= 2, `Expected ≥2 api results, got ${results.length}`);
  },

  "every entry has required meta fields": async () => {
    const domains = loader.getAllDomains();
    for (const d of domains) {
      const entry = loader.getEntry(d);
      assert.ok(entry, `Entry ${d} should load`);
      assert.ok(entry!.meta.domain, `${d}: missing meta.domain`);
      assert.ok(entry!.meta.version, `${d}: missing meta.version`);
      assert.ok(entry!.meta.tags.length > 0, `${d}: must have ≥1 tag`);
      assert.ok(entry!.context_inputs.length > 0, `${d}: must have ≥1 context_input`);
      assert.ok(entry!.decision_tree.length > 0, `${d}: must have ≥1 decision_tree node`);
    }
  },
};
