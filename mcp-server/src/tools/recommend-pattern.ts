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

/**
 * Simple keyword discovery: score domains by how many context values
 * (as lowercase strings) match against the entry's tags and description.
 */
function scoreDomainsByContext(
  loader: CookbookLoader,
  context: Record<string, unknown>
): Map<string, number> {
  const scores = new Map<string, number>();
  const contextTokens = new Set<string>();

  for (const v of Object.values(context)) {
    if (typeof v === "string") {
      v.toLowerCase().split(/\s+/).forEach((t) => {
        if (t.length > 2) contextTokens.add(t);
      });
    } else if (Array.isArray(v)) {
      for (const item of v) {
        if (typeof item === "string") {
          item.toLowerCase().split(/\s+/).forEach((t) => {
            if (t.length > 2) contextTokens.add(t);
          });
        }
      }
    } else if (typeof v === "boolean" && v) {
      // boolean true hints are strong signals
      contextTokens.add("true");
    }
  }

  for (const domain of loader.getAllDomains()) {
    const entry = loader.getEntry(domain);
    if (!entry) continue;

    let score = 0;
    const text = (
      (entry.meta.description || "") +
      " " +
      (entry.meta.tags || []).join(" ")
    ).toLowerCase();

    for (const token of contextTokens) {
      if (text.includes(token)) score += 1;
    }

    // Boost if context keys directly match context_inputs
    const inputNames = new Set(entry.context_inputs.map((ci) => ci.name));
    for (const key of Object.keys(context)) {
      if (inputNames.has(key)) score += 3;
    }

    if (score > 0) scores.set(domain, score);
  }

  return scores;
}

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
  const discoveryEntries: Array<{
    domain: string;
    description: string;
    tags: string[];
    context_inputs: Array<{ name: string; type: string; description: string; required: boolean; default?: unknown }>;
  }> = [];

  let evaluatedCount = 0;

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
      // In discovery mode (no explicit domains), collect entry metadata
      // instead of skipping entirely. This helps agents know what inputs to ask for.
      discoveryEntries.push({
        domain: entry.meta.domain,
        description: entry.meta.description,
        tags: entry.meta.tags,
        context_inputs: entry.context_inputs.map((ci) => ({
          name: ci.name,
          type: ci.type,
          description: ci.description,
          required: ci.required ?? true,
          default: ci.default,
        })),
      });
      continue;
    }

    const rec = buildRecommendation(entry, args.context);
    recommendations.push(rec);
    evaluatedCount++;

    if (rec.matched_node === "fallback") {
      fallbacksUsed.push(domain);
    }
  }

  // If explicit domains were requested but no recommendations came out,
  // include them anyway as fallbacks so the agent sees *something*.
  if (args.domains?.length && recommendations.length === 0) {
    for (const domain of targetDomains) {
      const entry = loader.getEntry(domain);
      if (!entry) continue;
      const rec = buildRecommendation(entry, args.context);
      recommendations.push(rec);
      if (rec.matched_node === "fallback") {
        fallbacksUsed.push(domain);
      }
    }
  }

  // If no domains specified and no context matches anything, score by keywords
  // and return the top discovery entries plus recommendations for the top-scored domains.
  if (!args.domains?.length && recommendations.length === 0 && discoveryEntries.length > 0) {
    const scores = scoreDomainsByContext(loader, args.context);
    const scored = Array.from(scores.entries()).sort((a, b) => b[1] - a[1]);
    const topDomains = scored.slice(0, 6).map((s) => s[0]);

    for (const domain of topDomains) {
      const entry = loader.getEntry(domain);
      if (!entry) continue;
      const rec = buildRecommendation(entry, args.context);
      recommendations.push(rec);
      if (rec.matched_node === "fallback") {
        fallbacksUsed.push(domain);
      }
    }

    // If still nothing, return top 6 discovery entries so the agent can ask for inputs
    if (recommendations.length === 0) {
      return {
        mode: "discovery" as const,
        message: "No context keys matched any domain's required inputs. Provide more context or specify domains explicitly.",
        recommendations: [],
        unmatched_domains: unmatchedDomains,
        fallbacks_used: fallbacksUsed,
        suggested_domains: discoveryEntries.slice(0, 6),
        tool_invocation_snippet: {
          machine: { name: "recommend_pattern", input: { context: args.context, domains: args.domains } },
          human: `Call the tool recommend_pattern with input: ${JSON.stringify({ context: args.context, domains: args.domains }, null, 2)}`,
        },
      };
    }
  }

  return {
    mode: recommendations.length > 0 ? "recommendation" : "discovery",
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
    discovery_entries: discoveryEntries.length > 0 ? discoveryEntries.slice(0, 6) : undefined,
    tool_invocation_snippet: {
      machine: { name: "recommend_pattern", input: { context: args.context, domains: args.domains } },
      human: `Call the tool recommend_pattern with input: ${JSON.stringify({ context: args.context, domains: args.domains }, null, 2)}`,
    },
  };
}
