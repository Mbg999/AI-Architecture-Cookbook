import { z } from "zod";
import type { CookbookLoader } from "../loader.js";
import yaml from "js-yaml";

export const queryStandardSchema = z.object({
  domain: z.string().describe("Kebab-case domain identifier (e.g., 'authentication', 'api-design')"),
});

export function queryStandard(loader: CookbookLoader, args: z.infer<typeof queryStandardSchema>) {
  const entry = loader.getEntry(args.domain);
  if (!entry) {
    return { found: false, domain: args.domain, error: `Domain '${args.domain}' not found` };
  }

  const idx = loader.getIndex();
  const category = idx.categories.find((c) =>
    c.entries.some((e) => e.domain === args.domain)
  );

  return {
    found: true,
    domain: args.domain,
    category: category?.id ?? "unknown",
    version: entry.meta.version,
    content: yaml.dump(entry, { lineWidth: 120 }),
    meta: entry.meta,
  };
}
