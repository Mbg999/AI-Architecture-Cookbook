import assert from "node:assert/strict";
import { CookbookLoader } from "../dist/loader.js";
import { recommendPatternNl } from "../dist/tools/recommend-pattern-nl.js";
import { resolve } from "node:path";

const REPO_ROOT = resolve(import.meta.dirname, "../..");
const loader = new CookbookLoader(REPO_ROOT);

export default {
  "recommend_pattern_nl returns at least one recommendation": async () => {
    const text =
      "Recommend the top 3 architecture patterns for an enterprise web+mobile application that requires user login and has real-time features.";

    const res = recommendPatternNl(loader, { text });

    assert.ok(res && Array.isArray(res.recommendations), "Should return a recommendations array");
    assert.ok(res.recommendations.length >= 1, `Expected ≥1 recommendation, got ${res.recommendations.length}`);

    // Each recommendation should include domain and pattern name
    for (const r of res.recommendations) {
      assert.ok(r.domain, "Recommendation must include domain");
      assert.ok(r.pattern, "Recommendation must include pattern name");
    }
  },
};
