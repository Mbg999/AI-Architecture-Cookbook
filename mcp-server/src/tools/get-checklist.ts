import { z } from "zod";
import type { CookbookLoader } from "../loader.js";

export const getChecklistSchema = z.object({
  domain: z.string().describe("Kebab-case domain identifier"),
  severity: z
    .enum(["critical", "high", "medium", "low"])
    .optional()
    .describe("Filter by severity level"),
});

export function getChecklist(loader: CookbookLoader, args: z.infer<typeof getChecklistSchema>) {
  const entry = loader.getEntry(args.domain);
  if (!entry) {
    return { domain: args.domain, items: [], total: 0, error: `Domain '${args.domain}' not found` };
  }

  let items = entry.checklist ?? [];
  if (args.severity) {
    items = items.filter((c) => c.severity === args.severity);
  }

  return {
    domain: args.domain,
    items: items.map((c) => ({
      id: c.id,
      description: c.description,
      category: c.category,
      severity: c.severity,
      verified_by: c.verified_by,
    })),
    total: items.length,
  };
}
