import { z } from "zod";
import type { CookbookLoader } from "../loader.js";
import { buildRecommendation, type Recommendation } from "../evaluator.js";

export const recommendPatternSchema = z.object({
  context: z
    .record(z.unknown())
    .describe("Key-value pairs matching context_inputs from entries"),
  domains: z
    .array(z.string())
    .optional()
    .describe("Limit recommendation to specific domains (default: all)"),
  format: z
    .enum(["human", "machine", "short"]) 
    .optional()
    .describe("Preferred output format for prompts and snippets"),
  include_trace: z.boolean().optional().describe("If true, include decision tree trace details"),
});

const CONFIDENCE_ORDER: Record<string, number> = { high: 3, medium: 2, low: 1 };

export function recommendPattern(
  loader: CookbookLoader,
  args: z.infer<typeof recommendPatternSchema>
) {
  const targetDomains = args.domains?.length
    ? args.domains
    : loader.getAllDomains();

  const recommendations: Recommendation[] = [];
  const unmatchedDomains: string[] = [];
  const fallbacksUsed: string[] = [];

  for (const domain of targetDomains) {
    const entry = loader.getEntry(domain);
    if (!entry) {
      unmatchedDomains.push(domain);
      continue;
    }

    // Check if any context keys match this entry's context_inputs
    const inputNames = new Set(entry.context_inputs.map((ci) => ci.name));
    const hasRelevantContext = Object.keys(args.context).some((k) =>
      inputNames.has(k)
    );

    if (!hasRelevantContext && !args.domains?.length) {
      // Skip entries with no relevant context inputs (when scanning all)
      continue;
    }

    const rec = buildRecommendation(entry, args.context);
    recommendations.push(rec);

    if (rec.matched_node === "fallback") {
      fallbacksUsed.push(domain);
    }
  }

  return {
    recommendations: recommendations.sort((a, b) => {
      // Sort: dynamic confidence first, then coverage_ratio, then critical items
      const aConf = CONFIDENCE_ORDER[a.confidence] ?? 1;
      const bConf = CONFIDENCE_ORDER[b.confidence] ?? 1;
      if (aConf !== bConf) return bConf - aConf;
      // Secondary: coverage ratio (higher is better)
      const aCov = a.coverage_ratio ?? 0;
      const bCov = b.coverage_ratio ?? 0;
      if (aCov !== bCov) return bCov - aCov;
      return b.checklist_summary.critical - a.checklist_summary.critical;
    }),
    unmatched_domains: unmatchedDomains,
    fallbacks_used: fallbacksUsed,
    tool_invocation_snippet: {
      machine: { name: "recommend_pattern", input: { context: args.context, domains: args.domains } },
      human: `Call the tool recommend_pattern with input: ${JSON.stringify({ context: args.context, domains: args.domains }, null, 2)}`,
    },
  };
}
