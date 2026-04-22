import assert from "node:assert/strict";
import { CookbookLoader } from "../src/loader.js";
import {
  evaluateNode,
  evaluateDecisionTree,
  buildRecommendation,
} from "../src/evaluator.js";
import { resolve } from "node:path";

const REPO_ROOT = resolve(import.meta.dirname, "../..");
const loader = new CookbookLoader(REPO_ROOT);

export default {
  "evaluateNode matches when conditions are met": async () => {
    const auth = loader.getEntry("authentication")!;
    // login_requires_oidc checks: needs_login == true
    const loginNode = auth.decision_tree.find((n) => n.id === "login_requires_oidc");
    assert.ok(loginNode, "Should find login_requires_oidc node");
    const result = evaluateNode(loginNode!, { needs_login: true });
    assert.equal(result, true, "Node should match with needs_login=true");
  },

  "evaluateNode rejects when conditions are not met": async () => {
    const auth = loader.getEntry("authentication")!;
    const loginNode = auth.decision_tree.find((n) => n.id === "login_requires_oidc");
    assert.ok(loginNode);
    const result = evaluateNode(loginNode!, { needs_login: false });
    assert.equal(result, false, "Node should NOT match with needs_login=false");
  },

  "evaluateNode returns false for missing context key": async () => {
    const auth = loader.getEntry("authentication")!;
    const node = auth.decision_tree[0];
    const result = evaluateNode(node, {});
    assert.equal(result, false, "Should return false when context keys are missing");
  },

  "evaluateDecisionTree returns pattern for matching context": async () => {
    const auth = loader.getEntry("authentication")!;
    const result = evaluateDecisionTree(auth, { client_types: "web", needs_login: true });
    assert.ok(result.pattern, "Should return a pattern");
    assert.equal(result.is_fallback, false, "Should not be a fallback");
    assert.ok(result.node_id !== "fallback", "node_id should not be 'fallback'");
  },

  "evaluateDecisionTree returns fallback for empty context": async () => {
    const auth = loader.getEntry("authentication")!;
    const result = evaluateDecisionTree(auth, {});
    assert.ok(result.pattern, "Fallback should still return a pattern");
    assert.equal(result.is_fallback, true, "Should be a fallback");
    assert.equal(result.node_id, "fallback");
  },

  "buildRecommendation returns full structure": async () => {
    const auth = loader.getEntry("authentication")!;
    const rec = buildRecommendation(auth, { client_types: "web", needs_login: true });
    assert.equal(rec.domain, "authentication");
    assert.ok(rec.pattern, "Should have a pattern");
    assert.ok(rec.pattern_name, "Should have a pattern_name");
    assert.ok(rec.confidence, "Should have confidence");
    assert.ok(rec.matched_node, "Should have matched_node");
    assert.ok(rec.rationale, "Should have rationale");
    assert.ok(typeof rec.checklist_summary.critical === "number");
    assert.ok(typeof rec.checklist_summary.high === "number");
    assert.ok(typeof rec.checklist_summary.total === "number");
    assert.ok(rec.checklist_summary.total > 0, "Should have checklist items");
  },

  "buildRecommendation fallback has description-based rationale": async () => {
    const auth = loader.getEntry("authentication")!;
    const rec = buildRecommendation(auth, {});
    assert.equal(rec.matched_node, "fallback");
    assert.ok(!rec.rationale.includes("Matched decision node"), "Fallback rationale should differ");
  },
};
