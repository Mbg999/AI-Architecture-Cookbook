import { z } from 'zod';
import type { CookbookLoader } from '../loader.js';
import { recommendPattern } from './recommend-pattern.js';
import { validateRecommendationContext } from './collect-recommendation-context.js';
import { getChecklist } from './get-checklist.js';
import { promptRecipes } from './prompt-recipes.js';
import { resolveCrossDomain, type ConflictWarning, type DomainOrder } from '../cross-domain-resolver.js';

type PatternResult = ReturnType<typeof recommendPattern> & {
  decision_traces?: Record<string, unknown>;
  checklists?: Record<string, unknown>;
  scaffold?: Record<string, unknown>;
  cross_domain?: {
    domain_order: DomainOrder[];
    conflicts: ConflictWarning[];
    evaluation_order: string[];
    consistency_score: number;
  };
};

export const recommendWorkflowSchema = z.object({
  context: z.record(z.unknown()).optional(),
  mode: z.enum(['quick', 'audit', 'scaffold']).default('quick'),
  domains: z.array(z.string()).optional(),
  include_trace: z.boolean().optional(),
  include_checklist: z.boolean().optional(),
});

export function recommendWorkflow(loader: CookbookLoader, args: z.infer<typeof recommendWorkflowSchema>) {
  const inputContext = args.context || {};

  const validation = validateRecommendationContext(inputContext as unknown);
  const normalizedContext = validation.normalizedContext as Record<string, unknown>;

  const rec = recommendPattern(loader, { context: normalizedContext, domains: args.domains }) as PatternResult;

  const recs = rec.recommendations || [];

  if (args.include_trace || args.mode === 'audit') {
    const traces: Record<string, unknown> = {};
    for (const r of recs) {
      try {
        const e = loader.getEntry(r.domain);
        if (!e) continue;
        const node = e.decision_tree.find((n) => n.id === r.matched_node) ?? null;
        traces[r.domain] = { matched_node: r.matched_node, node };
      } catch (e) {
        // ignore
      }
    }
    rec.decision_traces = traces;
  }

  if (args.include_checklist || args.mode === 'audit') {
    const checklists: Record<string, unknown> = {};
    for (const r of recs) {
      try {
        const cl = getChecklist(loader, { domain: r.domain });
        checklists[r.domain] = cl;
      } catch (e) {
        // ignore
      }
    }
    rec.checklists = checklists;
  }

  if (args.mode === 'scaffold') {
    const scaffolds: Record<string, unknown> = {};
    for (const r of recs) {
      try {
        const pr = promptRecipes(loader, { domain: r.domain, format: 'machine' });
        scaffolds[r.domain] = pr.recipes || pr;
      } catch (e) {
        // ignore
      }
    }
    rec.scaffold = scaffolds;
  }

  // Cross-domain consistency check (Phase 4)
  // Run when mode=audit or when multiple domains are involved
  if (args.mode === 'audit' || (recs.length > 1)) {
    try {
      const crossDomainResult = resolveCrossDomain(recs, loader);
      rec.cross_domain = crossDomainResult;
    } catch (e) {
      // Don't let cross-domain errors break the workflow
      console.error('Cross-domain resolution failed:', e);
    }
  }

  // Build a unified response that always includes both validation status
  // and the recommendation/discovery result so agents can see what is missing
  // AND what the cookbook can offer.
  const result: Record<string, unknown> = {
    valid: validation.valid,
    normalizedContext,
    validation: {
      valid: validation.valid,
      missingFields: validation.missingFields,
      nextQuestion: validation.nextQuestion,
      suggestions: validation.suggestions,
    },
    ...rec,
  };

  // When we are in discovery mode and context is incomplete, append guidance
  if (rec.mode === "discovery" && !validation.valid) {
    result.guidance =
      "Context is incomplete. The cookbook can recommend patterns once you provide the missing fields above. " +
      "Alternatively, call search_standards or query_standard directly for the relevant domain.";
  }

  return result;
}

export default recommendWorkflow;
