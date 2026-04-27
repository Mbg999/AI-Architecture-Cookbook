import assert from "node:assert/strict";
import { CookbookLoader } from "../dist/loader.js";
import { recommendPatternNl } from "../dist/tools/recommend-pattern-nl.js";
import { resolve } from "node:path";

const REPO_ROOT = resolve(import.meta.dirname, "../..");
const loader = new CookbookLoader(REPO_ROOT);

export default {
  "golden: enterprise web+mobile sets realtime and needs_login": async () => {
    const text =
      "Recommend the top 3 architecture patterns for an enterprise web+mobile application that requires user login and has real-time features.";

    const res = recommendPatternNl(loader, { text });

    assert.ok(res.parsed_args, "parsed_args should be present");
    const ctx = res.parsed_args?.context || {};
    assert.strictEqual(ctx.needs_login, true, "needs_login should be true");
    assert.strictEqual(ctx.realtime, true, "realtime should be true");
    assert.ok(Array.isArray(res.recommendations) && res.recommendations.length >= 1, "≥1 recommendation expected");
  },

  "golden: top N honor - returns exactly top 2 when requested": async () => {
    const text =
      "Recommend the top 2 architecture patterns for an enterprise web+mobile application that requires user login and has real-time features.";

    const res = recommendPatternNl(loader, { text });
    assert.ok(Array.isArray(res.recommendations), "recommendations array expected");
    assert.strictEqual(res.recommendations.length, 2, `Expected exactly 2 recommendations, got ${res.recommendations.length}`);
  },

  "golden: gdpr/regulatory detection sets regulatory_required": async () => {
    const text = "We process personal data and must be GDPR compliant with strict retention policies.";
    const res = recommendPatternNl(loader, { text });
    const ctx = res.parsed_args?.context || {};
    assert.strictEqual(ctx.regulatory_required, true, "regulatory_required should be true for GDPR prompts");
    assert.strictEqual(ctx.data_sensitivity, "high", "data_sensitivity should default to high for GDPR prompts");
  },

  "golden: e2ee + mau + low-latency detected for chat": async () => {
    const text = "Building a mobile chat with e2ee for millions of MAU and low-latency real-time messaging.";
    const res = recommendPatternNl(loader, { text });
    const ctx = res.parsed_args?.context || {};
    assert.strictEqual(ctx.end_to_end_encryption, true, "e2ee should be detected");
    assert.strictEqual(ctx.realtime, true, "realtime should be detected");
    assert.strictEqual(ctx.user_count, "massive", "user_count should be classified as massive");
  },
};
