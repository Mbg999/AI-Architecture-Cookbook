import assert from "node:assert/strict";
import { CookbookLoader } from "../src/loader.js";
import { recommendPatternNl } from "../src/tools/recommend-pattern-nl.js";

export default {
  'recommendPatternNl respects format=machine and returns invocation snippet': async () => {
    const loader = new CookbookLoader();
    const resp: any = recommendPatternNl(loader, { text: 'Recommend architecture for a real-time chat app with mobile clients and GDPR.', format: 'machine', include_trace: true, top: 2 });
    assert.ok(resp.tool_invocation && resp.tool_invocation.name === 'recommend_pattern', 'expected tool_invocation for machine format');
    assert.ok(Array.isArray(resp.recommendations) && resp.recommendations.length > 0, 'expected recommendations array');
    assert.ok(resp.decision_traces && typeof resp.decision_traces === 'object', 'expected decision_traces when include_trace=true');
  },

  'recommendPatternNl respects format=short and returns compact recommendations': async () => {
    const loader = new CookbookLoader();
    const resp: any = recommendPatternNl(loader, { text: 'Recommend architecture for a realtime chat app with mobile clients', format: 'short' });
    assert.ok(Array.isArray(resp.recommendations), 'expected recommendations array');
    assert.ok(resp.recommendations.length > 0, 'expected at least one recommendation');
    const r = resp.recommendations[0];
    assert.ok(r.domain && r.pattern && r.one_line_rationale, 'expected compact fields in short format');
  },
};
