import assert from "node:assert/strict";
import { CookbookLoader } from "../src/loader.js";
import { queryStandard } from "../src/tools/query-standard.js";
import { searchStandards } from "../src/tools/search-standards.js";
import { getChecklist } from "../src/tools/get-checklist.js";
import { getDecisionTree } from "../src/tools/get-decision-tree.js";
import { recommendPattern } from "../src/tools/recommend-pattern.js";
import { resolve } from "node:path";

const REPO_ROOT = resolve(import.meta.dirname, "../..");
const loader = new CookbookLoader(REPO_ROOT);

export default {
  // --- query_standard ---
  "query_standard returns found entry": async () => {
    const res = queryStandard(loader, { domain: "authentication" });
    assert.equal(res.found, true);
    assert.equal(res.domain, "authentication");
    assert.equal(res.category, "foundational");
    assert.ok(res.content, "Should have YAML content");
    assert.ok(res.meta, "Should have meta");
  },

  "query_standard returns not-found for unknown domain": async () => {
    const res = queryStandard(loader, { domain: "no-such-thing" });
    assert.equal(res.found, false);
    assert.ok(res.error);
  },

  // --- search_standards ---
  "search_standards by tags": async () => {
    const res = searchStandards(loader, { tags: ["security"] });
    assert.ok(res.total >= 3, `Expected ≥3 security results, got ${res.total}`);
    assert.ok(res.results.every((r: any) => r.domain && r.category));
  },

  "search_standards by categories": async () => {
    const res = searchStandards(loader, { categories: ["infrastructure"] });
    assert.equal(res.total, 7, `Expected 7 infrastructure entries, got ${res.total}`);
  },

  "search_standards by query": async () => {
    const res = searchStandards(loader, { query: "container" });
    assert.ok(res.total >= 1, "Should find at least containerization");
    assert.ok(res.results.some((r: any) => r.domain === "containerization"));
  },

  "search_standards combined filters": async () => {
    const res = searchStandards(loader, {
      tags: ["security"],
      categories: ["foundational"],
    });
    assert.ok(res.total >= 1);
    assert.ok(res.results.every((r: any) => r.category === "foundational"));
  },

  "search_standards no filters returns all": async () => {
    const res = searchStandards(loader, {});
    assert.equal(res.total, 43, `Expected 43, got ${res.total}`);
  },

  // --- get_checklist ---
  "get_checklist returns items for authentication": async () => {
    const res = getChecklist(loader, { domain: "authentication" });
    assert.ok(res.total >= 10, `Expected ≥10 checklist items, got ${res.total}`);
    assert.ok(res.items.every((i: any) => i.id && i.severity));
  },

  "get_checklist filters by severity": async () => {
    const res = getChecklist(loader, { domain: "authentication", severity: "critical" });
    assert.ok(res.total >= 1, "Should have ≥1 critical item");
    assert.ok(res.items.every((i: any) => i.severity === "critical"));
  },

  "get_checklist returns error for unknown domain": async () => {
    const res = getChecklist(loader, { domain: "nope" });
    assert.equal(res.total, 0);
    assert.ok(res.error);
  },

  // --- get_decision_tree ---
  "get_decision_tree returns tree for authentication": async () => {
    const res = getDecisionTree(loader, { domain: "authentication" });
    assert.ok(!("error" in res), "Should not have error");
    assert.ok(res.context_inputs.length > 0, "Should have context inputs");
    assert.ok(res.decision_tree.length > 0, "Should have decision tree nodes");
    assert.ok(res.decision_metadata, "Should have metadata");
  },

  "get_decision_tree returns error for unknown domain": async () => {
    const res = getDecisionTree(loader, { domain: "nope" });
    assert.ok("error" in res);
  },

  // --- recommend_pattern ---
  "recommend_pattern with specific domain": async () => {
    const res = recommendPattern(loader, {
      context: { client_types: "web", needs_login: true },
      domains: ["authentication"],
    });
    assert.equal(res.recommendations.length, 1);
    assert.equal(res.recommendations[0].domain, "authentication");
    assert.ok(res.recommendations[0].pattern);
  },

  "recommend_pattern without domains scans all": async () => {
    const res = recommendPattern(loader, {
      context: { client_types: "web", needs_login: true },
    });
    // Should find at least authentication (has client_types in context_inputs)
    assert.ok(res.recommendations.length >= 1, "Should match ≥1 domain");
  },

  "recommend_pattern reports unknown domains": async () => {
    const res = recommendPattern(loader, {
      context: { x: "y" },
      domains: ["fake-domain"],
    });
    assert.ok(res.unmatched_domains.includes("fake-domain"));
  },
};
