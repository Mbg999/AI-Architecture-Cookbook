import { z } from "zod";
import type { CookbookLoader } from "../loader.js";

export const getDecisionTreeSchema = z.object({
  domain: z.string().describe("Kebab-case domain identifier"),
});

export function getDecisionTree(loader: CookbookLoader, args: z.infer<typeof getDecisionTreeSchema>) {
  const entry = loader.getEntry(args.domain);
  if (!entry) {
    return { domain: args.domain, error: `Domain '${args.domain}' not found` };
  }

  return {
    domain: args.domain,
    context_inputs: entry.context_inputs.map((ci) => ({
      name: ci.name,
      type: ci.type,
      description: ci.description,
      required: ci.required,
      default: ci.default,
      enum_values: ci.enum_values,
    })),
    decision_tree: entry.decision_tree.map((node) => ({
      id: node.id,
      priority: node.priority,
      if: node.if,
      then: node.then,
      else: node.else,
    })),
    decision_metadata: entry.decision_metadata,
  };
}
