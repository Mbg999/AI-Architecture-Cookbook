import { z } from 'zod';
import type { CookbookLoader } from '../loader.js';
import { recommendPattern } from './recommend-pattern.js';
import { validateRecommendationContext } from './collect-recommendation-context.js';
import { getChecklist } from './get-checklist.js';
import { promptRecipes } from './prompt-recipes.js';

export const recommendWorkflowSchema = z.object({
  context: z.record(z.unknown()).optional(),
  mode: z.enum(['quick', 'audit', 'scaffold']).default('quick'),
  domains: z.array(z.string()).optional(),
  include_trace: z.boolean().optional(),
  include_checklist: z.boolean().optional(),
});

export function recommendWorkflow(loader: CookbookLoader, args: z.infer<typeof recommendWorkflowSchema>) {
  const inputContext = args.context || {};

  // Validate & normalize the context
  const validation = validateRecommendationContext(inputContext as unknown);
  if (!validation.valid) {
    return {
      valid: false,
      missingFields: validation.missingFields,
      nextQuestion: validation.nextQuestion,
      normalizedContext: validation.normalizedContext,
    };
  }

  const normalizedContext = validation.normalizedContext as Record<string, unknown>;

  // Core recommendation
  const rec = recommendPattern(loader, { context: normalizedContext, domains: args.domains });

  // Attach traces when requested or in audit mode
  if (args.include_trace || args.mode === 'audit') {
    const traces: Record<string, unknown> = {};
    for (const r of rec.recommendations) {
      try {
        const e = loader.getEntry(r.domain);
        if (!e) continue;
        const node = e.decision_tree.find((n) => n.id === r.matched_node) ?? null;
        traces[r.domain] = { matched_node: r.matched_node, node };
      } catch (e) {
        // ignore
      }
    }
    (rec as any).decision_traces = traces;
  }

  // Attach checklists when requested or in audit mode
  if (args.include_checklist || args.mode === 'audit') {
    const checklists: Record<string, unknown> = {};
    for (const r of rec.recommendations) {
      try {
        const cl = getChecklist(loader, { domain: r.domain });
        checklists[r.domain] = cl;
      } catch (e) {
        // ignore
      }
    }
    (rec as any).checklists = checklists;
  }

  // Provide scaffold recipes in scaffold mode
  if (args.mode === 'scaffold') {
    const scaffolds: Record<string, unknown> = {};
    for (const r of rec.recommendations) {
      try {
        const pr = promptRecipes(loader, { domain: r.domain, format: 'machine' });
        scaffolds[r.domain] = pr.recipes || pr;
      } catch (e) {
        // ignore
      }
    }
    (rec as any).scaffold = scaffolds;
  }

  return {
    valid: true,
    normalizedContext,
    ...rec,
  };
}

export default recommendWorkflow;
