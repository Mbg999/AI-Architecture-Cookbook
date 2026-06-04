import { z } from "zod";
import type { CookbookLoader } from "../loader.js";
import { getTfIdfIndex } from "../semantic-search.js";

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
    // Try combined semantic + literal search first
    try {
      const tfidf = getTfIdfIndex(loader);
      const combined = tfidf.combinedSearch(loader, args.query, 20, {
        tags: args.tags,
        categories: args.categories,
      });

      if (combined.length > 0) {
        const resultMap = new Map(combined.map(r => [r.domain, r]));
        results = results.filter(r => resultMap.has(r.domain));
        results.sort((a, b) => {
          const sa = resultMap.get(a.domain)?.score ?? 0;
          const sb = resultMap.get(b.domain)?.score ?? 0;
          return sb - sa;
        });
      } else {
        // Fallback to literal-only search
        const q = args.query.toLowerCase();
        results = results.filter(
          (r) =>
            r.domain.includes(q) ||
            r.description.toLowerCase().includes(q) ||
            r.tags.some((t) => t.includes(q))
        );
      }
    } catch {
      // If semantic search fails (e.g. index not built), fall back to literal
      const q = args.query.toLowerCase();
      results = results.filter(
        (r) =>
          r.domain.includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.tags.some((t) => t.includes(q))
      );
    }
  }

  return {
    results: results.map((r) => ({
      domain: r.domain,
      category: r.category,
      description: r.description,
      version: r.version,
      tags: r.tags,
      path: r.path,
      ...(args.query ? { score: (r as any).score } : {}),
    })),
    total: results.length,
  };
}
