import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import yaml from "js-yaml";

export interface EntryMeta {
  schema_version: number;
  domain: string;
  version: string;
  last_updated: string;
  description: string;
  tags: string[];
  categories: string[];
  prerequisites: Array<string | { id: string; reason: string }>;
  related_standards: Array<{
    id: string;
    relationship: string;
    context: string;
  }>;
}

export interface ContextInput {
  name: string;
  type: string;
  description: string;
  required: boolean;
  default: unknown;
  enum_values?: string[];
}

export interface DecisionNode {
  id: string;
  priority: number;
  if: string[];
  then: { pattern: string; standards: string[]; notes: string };
  else?: { pattern: string; notes: string };
}

export interface DecisionMetadata {
  confidence: string;
  risk_if_wrong: string;
  fallback: { pattern: string; description: string };
}

export interface ChecklistItem {
  id: string;
  description: string;
  category: string;
  severity: string;
  verified_by: string;
}

export interface CookbookEntry {
  meta: EntryMeta;
  context_inputs: ContextInput[];
  decision_tree: DecisionNode[];
  decision_metadata: DecisionMetadata;
  patterns: Array<{ id: string; name: string; [key: string]: unknown }>;
  examples: Array<{ id: string; [key: string]: unknown }>;
  security_hardening: Record<string, unknown>;
  compliance: Record<string, unknown>;
  prompt_recipes: Array<{ id: string; [key: string]: unknown }>;
  anti_patterns: Array<{ id: string; [key: string]: unknown }>;
  checklist: ChecklistItem[];
}

export interface IndexEntry {
  domain: string;
  path: string;
  version: string;
  description: string;
  tags: string[];
  prerequisites: string[];
}

export interface IndexCategory {
  id: string;
  name: string;
  description: string;
  path: string;
  entry_count: number;
  entries: IndexEntry[];
}

export interface CookbookIndex {
  schema_version: number;
  name: string;
  description: string;
  total_entries: number;
  categories: IndexCategory[];
  tag_index: Record<string, string[]>;
}

const CATEGORIES = [
  "foundational",
  "application-architecture",
  "infrastructure",
  "security-quality",
  "integration-data",
];

export class CookbookLoader {
  private repoRoot: string;
  private index: CookbookIndex | null = null;
  private entryCache = new Map<string, CookbookEntry>();

  constructor(repoRoot?: string) {
    this.repoRoot = repoRoot ?? resolve(join(import.meta.dirname, ".."));
  }

  getIndex(): CookbookIndex {
    if (this.index) return this.index;

    const indexPath = join(this.repoRoot, "index.yaml");
    if (existsSync(indexPath)) {
      this.index = yaml.load(readFileSync(indexPath, "utf-8")) as CookbookIndex;
      return this.index;
    }

    // Fallback: build index from filesystem
    this.index = this.buildIndexFromDisk();
    return this.index;
  }

  getEntry(domain: string): CookbookEntry | null {
    if (this.entryCache.has(domain)) return this.entryCache.get(domain)!;

    const idx = this.getIndex();
    for (const cat of idx.categories) {
      for (const entry of cat.entries) {
        if (entry.domain === domain) {
          const fullPath = join(this.repoRoot, entry.path);
          if (!existsSync(fullPath)) return null;
          const parsed = yaml.load(
            readFileSync(fullPath, "utf-8")
          ) as CookbookEntry;
          this.entryCache.set(domain, parsed);
          return parsed;
        }
      }
    }
    return null;
  }

  getAllDomains(): string[] {
    const idx = this.getIndex();
    return idx.categories.flatMap((c) => c.entries.map((e) => e.domain));
  }

  searchByTags(tags: string[]): IndexEntry[] {
    const idx = this.getIndex();
    const matchDomains = new Set<string>();
    for (const tag of tags) {
      for (const domain of idx.tag_index[tag] ?? []) {
        matchDomains.add(domain);
      }
    }
    return idx.categories
      .flatMap((c) => c.entries)
      .filter((e) => matchDomains.has(e.domain));
  }

  searchByCategory(categoryIds: string[]): IndexEntry[] {
    const idx = this.getIndex();
    const catSet = new Set(categoryIds);
    return idx.categories
      .filter((c) => catSet.has(c.id))
      .flatMap((c) => c.entries);
  }

  searchByQuery(query: string): IndexEntry[] {
    const q = query.toLowerCase();
    return this.getIndex()
      .categories.flatMap((c) => c.entries)
      .filter(
        (e) =>
          e.domain.includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.tags.some((t) => t.includes(q))
      );
  }

  private buildIndexFromDisk(): CookbookIndex {
    const categories: IndexCategory[] = [];
    const tagIndex: Record<string, string[]> = {};

    for (const catDir of CATEGORIES) {
      const catPath = join(this.repoRoot, catDir);
      if (!existsSync(catPath)) continue;

      const indexPath = join(catPath, "_index.yaml");
      let catMeta: Record<string, unknown> = {};
      if (existsSync(indexPath)) {
        catMeta = yaml.load(readFileSync(indexPath, "utf-8")) as Record<
          string,
          unknown
        >;
      }

      const entries: IndexEntry[] = [];
      for (const sub of readdirSync(catPath).sort()) {
        const entryPath = join(catPath, sub, `${sub}.yaml`);
        if (!statSync(join(catPath, sub), { throwIfNoEntry: false })?.isDirectory()) continue;
        if (!existsSync(entryPath)) continue;

        const raw = yaml.load(readFileSync(entryPath, "utf-8")) as CookbookEntry;
        const m = raw.meta;
        const prereqs = (m.prerequisites ?? []).map((p) =>
          typeof p === "object" && p !== null && "id" in p
            ? (p as { id: string }).id
            : String(p)
        );

        entries.push({
          domain: m.domain,
          path: `${catDir}/${sub}/${sub}.yaml`,
          version: String(m.version),
          description: m.description.trim(),
          tags: m.tags ?? [],
          prerequisites: prereqs,
        });

        for (const t of m.tags ?? []) {
          if (!tagIndex[t]) tagIndex[t] = [];
          tagIndex[t].push(m.domain);
        }
      }

      categories.push({
        id: catDir,
        name: String(catMeta.name ?? catDir),
        description: String(catMeta.description ?? ""),
        path: `${catDir}/`,
        entry_count: entries.length,
        entries,
      });
    }

    return {
      schema_version: 1,
      name: "AI Architecture Cookbook",
      description: "Architectural standards and decision frameworks for AI code assistants",
      total_entries: categories.reduce((s, c) => s + c.entry_count, 0),
      categories,
      tag_index: Object.fromEntries(Object.entries(tagIndex).sort()),
    };
  }
}
