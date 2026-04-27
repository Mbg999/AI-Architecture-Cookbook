import { z } from "zod";
import type { CookbookLoader } from "../loader.js";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import yaml from "js-yaml";

export const promptRecipesSchema = z.object({
  domain: z.string().optional(),
  query: z.string().optional(),
  format: z.enum(["human", "machine", "short"]).optional(),
});

// Load curated recipes from mcp-server/data/curated-prompt-recipes.yaml if present
let CURATED_RECIPES: Record<string, any[]> = {};
try {
  const candidate1 = join(dirname(new URL(import.meta.url).pathname), "..", "data", "curated-prompt-recipes.yaml");
  const candidate2 = join(process.cwd(), "mcp-server", "data", "curated-prompt-recipes.yaml");
  const pathToUse = existsSync(candidate1) ? candidate1 : existsSync(candidate2) ? candidate2 : null;
  if (pathToUse) {
    const raw = readFileSync(pathToUse, "utf-8");
    const parsed = yaml.load(raw) as Record<string, any[]> | null;
    if (parsed) CURATED_RECIPES = parsed;
  }
} catch (e) {
  // ignore load errors — curated recipes are optional
}

export function promptRecipes(loader: CookbookLoader, args: z.infer<typeof promptRecipesSchema>) {
  const domain = args.domain;
  const query = args.query;
  const format = args.format || "human";

  const results: Array<any> = [];

  if (domain) {
    const entry = loader.getEntry(domain);
    if (!entry) return { recipes: [], domain, note: "domain not found" };

    const inputs = (entry.context_inputs || []).map((ci) => ci.name);

    const defaultContext: Record<string, unknown> = {};
    for (const n of inputs) defaultContext[n] = `<<${n}>>`;

    const recipes = entry.prompt_recipes || [];
    const curated = (CURATED_RECIPES[entry.meta.domain] || []) as any[];

    // curated first, then authored
    for (const r of curated) {
      results.push({
        id: r.id ?? `curated:${entry.meta.domain}`,
        domain: entry.meta.domain,
        title: (r.description as string) || (r.id as string) || `Curated recipe for ${entry.meta.domain}`,
        recipe: r,
        tool_invocation_snippet: {
          machine: { name: "recommend_pattern", input: { context: defaultContext, domains: [entry.meta.domain] } },
          human: `Call the tool recommend_pattern with input: ${JSON.stringify({ context: defaultContext, domains: [entry.meta.domain] }, null, 2)}`,
        },
      });
    }

    for (const r of recipes) {
      results.push({
        id: r.id ?? `recipe:${entry.meta.domain}`,
        title: (r.title as string) || (r.id as string) || `Recipe for ${entry.meta.domain}`,
        recipe: r,
        tool_invocation_snippet: {
          machine: { name: "recommend_pattern", input: { context: defaultContext, domains: [entry.meta.domain] } },
          human: `Call the tool recommend_pattern with input: ${JSON.stringify({ context: defaultContext, domains: [entry.meta.domain] }, null, 2)}`,
        },
      });
    }

    // If no authored recipes, synthesize one
    if (!recipes.length) {
      results.push({
        id: `auto:${entry.meta.domain}`,
        title: `Auto-generated prompt for ${entry.meta.domain}`,
        recipe: {
          prompt: `Recommend patterns for ${entry.meta.domain}. Provide top 3 with one-line rationale.`,
        },
        tool_invocation_snippet: {
          machine: { name: "recommend_pattern", input: { context: defaultContext, domains: [entry.meta.domain] } },
          human: `Call the tool recommend_pattern with input: ${JSON.stringify({ context: defaultContext, domains: [entry.meta.domain] }, null, 2)}`,
        },
      });
    }

    return { domain: entry.meta.domain, recipes: results };
  }

  // Query case: return prompt recipes from top-matching entries
  if (query) {
    const hits = loader.searchByQuery(query).slice(0, 6);
    for (const h of hits) {
      const entry = loader.getEntry(h.domain);
      if (!entry) continue;
      const curated = (CURATED_RECIPES[entry.meta.domain] || []) as any[];
      const recipes = entry.prompt_recipes || [];
      if (curated.length) {
        for (const r of curated) results.push({ domain: entry.meta.domain, id: r.id, title: r.description || r.id, recipe: r });
      }
      if (recipes.length) {
        for (const r of recipes) results.push({ domain: entry.meta.domain, id: r.id, title: r.title || r.id, recipe: r });
      }
      if (!curated.length && !recipes.length) {
        results.push({ domain: entry.meta.domain, id: `auto:${entry.meta.domain}`, title: `Auto prompt for ${entry.meta.domain}`, recipe: { prompt: `Recommend patterns for ${entry.meta.domain}` } });
      }
    }
    return { query, recipes: results };
  }

  // No args: provide a small sample of recipes from index
  const top = loader.getIndex().categories.flatMap((c) => c.entries).slice(0, 8);
  for (const e of top) {
    const entry = loader.getEntry(e.domain);
    if (!entry) continue;
    const curated = (CURATED_RECIPES[entry.meta.domain] || []) as any[];
    const recipes = entry.prompt_recipes || [];
    if (curated.length) {
      for (const r of curated) results.push({ domain: entry.meta.domain, id: r.id, title: r.description || r.id, recipe: r });
    }
    if (recipes.length) {
      for (const r of recipes) results.push({ domain: entry.meta.domain, id: r.id, title: r.title || r.id, recipe: r });
    }
    if (!curated.length && !recipes.length) {
      results.push({ domain: entry.meta.domain, id: `auto:${entry.meta.domain}`, title: `Auto prompt for ${entry.meta.domain}`, recipe: { prompt: `Recommend patterns for ${entry.meta.domain}` } });
    }
  }

  return { recipes: results };
}
