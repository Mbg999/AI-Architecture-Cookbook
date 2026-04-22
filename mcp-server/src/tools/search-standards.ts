import { z } from "zod";
import type { CookbookLoader } from "../loader.js";

export const searchStandardsSchema = z.object({
  tags: z.array(z.string()).optional().describe("Filter by tags (OR logic)"),
  categories: z.array(z.string()).optional().describe("Filter by category IDs (OR logic)"),
  query: z.string().optional().describe("Free-text search across domain, description, tags"),
});

export function searchStandards(loader: CookbookLoader, args: z.infer<typeof searchStandardsSchema>) {
  let results = loader.getIndex().categories.flatMap((c) =>
    c.entries.map((e) => ({ ...e, category: c.id }))
  );

  if (args.tags?.length) {
    const tagMatches = new Set(loader.searchByTags(args.tags).map((e) => e.domain));
    results = results.filter((r) => tagMatches.has(r.domain));
  }

  if (args.categories?.length) {
    const catSet = new Set(args.categories);
    results = results.filter((r) => catSet.has(r.category));
  }

  if (args.query) {
    const q = args.query.toLowerCase();
    results = results.filter(
      (r) =>
        r.domain.includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.tags.some((t) => t.includes(q))
    );
  }

  return {
    results: results.map((r) => ({
      domain: r.domain,
      category: r.category,
      description: r.description,
      version: r.version,
      tags: r.tags,
      path: r.path,
    })),
    total: results.length,
  };
}
