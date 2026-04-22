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
});

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
      // Sort: high confidence first, then by critical checklist items
      const confOrder = { high: 0, medium: 1, low: 2 };
      const aConf = confOrder[a.confidence as keyof typeof confOrder] ?? 1;
      const bConf = confOrder[b.confidence as keyof typeof confOrder] ?? 1;
      if (aConf !== bConf) return aConf - bConf;
      return b.checklist_summary.critical - a.checklist_summary.critical;
    }),
    unmatched_domains: unmatchedDomains,
    fallbacks_used: fallbacksUsed,
  };
}
