import { z } from "zod";
import type { CookbookLoader } from "../loader.js";
import { buildRecommendation } from "../evaluator.js";

export const explainDecisionSchema = z.object({
  domain: z.string().describe("Kebab-case domain identifier"),
  pattern_id: z.string().optional().describe("Specific pattern ID to explain. If omitted, explains the recommended pattern"),
  context: z.record(z.unknown()).optional().describe("Context used for the decision"),
  format: z.enum(["narrative", "structured", "short"]).optional().default("narrative"),
});

export function explainDecision(
  loader: CookbookLoader,
  args: z.infer<typeof explainDecisionSchema>
) {
  const entry = loader.getEntry(args.domain);
  if (!entry) {
    return { found: false, domain: args.domain, error: `Domain '${args.domain}' not found` };
  }

  const ctx = args.context ?? {};
  const recommendation = buildRecommendation(entry, ctx);

  if (args.pattern_id) {
    // Explain a specific pattern (whether recommended or not)
    const pattern: any = entry.patterns.find(p => p.id === args.pattern_id);
    if (!pattern) {
      return { found: false, domain: args.domain, pattern_id: args.pattern_id, error: `Pattern '${args.pattern_id}' not found in domain` };
    }

    const isRecommended = recommendation.pattern === args.pattern_id;
    const whyNotSelected = !isRecommended
      ? recommendation.alternatives_considered?.find(a => a.pattern === args.pattern_id)
      : undefined;

    const result: Record<string, unknown> = {
      domain: args.domain,
      pattern_id: args.pattern_id,
      pattern_name: String(pattern.name),
      is_recommended: isRecommended,
    };

    if (isRecommended) {
      result.decision_rationale = recommendation.decision_rationale;
      result.confidence = recommendation.confidence;
      result.coverage_ratio = recommendation.coverage_ratio;
      result.tradeoffs = pattern.tradeoffs ?? null;
      if (args.format === "short") {
        result.explanation = `✅ ${pattern.name}: ${recommendation.decision_rationale}`;
      } else if (args.format === "structured") {
        result.implementation_guidelines = pattern.implementation?.guidelines ?? [];
        result.use_when = pattern.use_when ?? [];
        result.avoid_when = pattern.avoid_when ?? [];
      } else {
        const pros = (pattern.tradeoffs?.pros ?? []).join(", ");
        const cons = (pattern.tradeoffs?.cons ?? []).join(", ");
        result.explanation = `Pattern "${pattern.name}" is recommended for '${args.domain}'.\n` +
          `Confidence: ${recommendation.confidence} (coverage: ${Math.round((recommendation.coverage_ratio ?? 0) * 100)}%).\n` +
          `Rationale: ${recommendation.decision_rationale}\n` +
          `Pros: ${pros || "none listed"}\n` +
          `Cons: ${cons || "none listed"}`;
      }
    } else {
      const alt = recommendation.alternatives_considered?.find(a => a.pattern === args.pattern_id);
      result.why_not_selected = whyNotSelected?.why_not_selected ?? "Not in alternatives list";
      result.score = alt?.score ?? 0;
      result.coverage_ratio = alt?.coverage_ratio ?? 0;
      result.tradeoffs = pattern.tradeoffs ?? null;
      result.recommended_instead = recommendation.pattern_name;

      if (args.format === "short") {
        result.explanation = `❌ ${pattern.name}: ${result.why_not_selected}`;
      } else if (args.format === "structured") {
        result.implementation_guidelines = pattern.implementation?.guidelines ?? [];
      } else {
        result.explanation = `Pattern "${pattern.name}" was NOT selected for '${args.domain}'.\n` +
          `Why: ${result.why_not_selected}\n` +
          `Instead, "${result.recommended_instead}" is preferred.\n` +
          `Pattern "${pattern.name}" has score ${alt?.score?.toFixed(2) ?? "N/A"}, ` +
          `coverage ${Math.round((alt?.coverage_ratio ?? 0) * 100)}%.\n` +
          `Use it if: ${(pattern.use_when ?? []).join("; ") || "not specified"}`;
      }
    }

    return result;
  }

  // No specific pattern — explain the recommendation itself
  const pattern: any = entry.patterns.find(p => p.id === recommendation.pattern);

  const result: Record<string, unknown> = {
    domain: args.domain,
    recommended_pattern: recommendation.pattern,
    recommended_pattern_name: recommendation.pattern_name,
    confidence: recommendation.confidence,
    coverage_ratio: recommendation.coverage_ratio,
    decision_rationale: recommendation.decision_rationale,
    inputs_provided: recommendation.inputs_provided,
    inputs_total: recommendation.inputs_total,
    inputs_missing: recommendation.inputs_missing,
    alternatives: recommendation.alternatives_considered?.map(a => ({
      pattern: a.pattern,
      pattern_name: a.pattern_name,
      score: a.score,
      why_not_selected: a.why_not_selected,
    })),
  };

  if (pattern?.tradeoffs) {
    result.tradeoffs = pattern.tradeoffs;
  }

  if (args.format === "short") {
    result.summary = recommendation.decision_rationale;
  } else if (args.format === "structured") {
    result.use_when = pattern?.use_when ?? [];
    result.avoid_when = pattern?.avoid_when ?? [];
    result.implementation_guidelines = pattern?.implementation?.guidelines ?? [];
  } else {
    const altList = (recommendation.alternatives_considered ?? [])
      .map(a => `  - ${a.pattern_name}: ${a.why_not_selected}`)
      .join("\n");
    result.narrative = `Decision for ${args.domain}:\n` +
      `${recommendation.decision_rationale}\n\n` +
      `Alternatives considered:\n${altList || "  None"}`;
  }

  return result;
}
