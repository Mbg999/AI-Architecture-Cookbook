import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import type { CookbookLoader } from "./loader.js";
import type { Recommendation } from "./evaluator.js";

export interface ConflictWarning {
  domain_a: string;
  domain_b: string;
  pattern_a: string;
  pattern_b: string;
  severity: "info" | "warning" | "critical";
  description: string;
  resolution?: string;
}

export interface DomainOrder {
  domain: string;
  depth: number;
  depends_on: string[];
}

interface ConflictRule {
  domain: string;
  pattern: string;
  conflicts_with: Array<{
    domain: string;
    pattern: string;
    severity: "info" | "warning" | "critical";
    description: string;
    resolution?: string;
  }>;
}

interface ConflictFile {
  schema_version: number;
  last_updated: string;
  rules: ConflictRule[];
}

const FALLBACK_RULES: ConflictRule[] = [
  {
    domain: "authentication",
    pattern: "token_based_auth",
    conflicts_with: [
      {
        domain: "session-management",
        pattern: "server_side_sessions",
        severity: "warning",
        description: "Token-based auth (stateless JWT) conflicts with server-side sessions (stateful). Mixing both creates unnecessary complexity.",
        resolution: "Choose one unified session strategy: stateless JWT with refresh rotation, or server-side sessions with sticky sessions / distributed session store.",
      },
    ],
  },
  {
    domain: "session-management",
    pattern: "server_side_sessions",
    conflicts_with: [
      {
        domain: "authentication",
        pattern: "token_based_auth",
        severity: "warning",
        description: "Server-side sessions (stateful) conflicts with token-based auth (stateless JWT).",
        resolution: "Choose one unified session strategy.",
      },
    ],
  },
  {
    domain: "service-architecture",
    pattern: "modular_monolith",
    conflicts_with: [
      {
        domain: "service-architecture",
        pattern: "microservices",
        severity: "critical",
        description: "Modular monolith and microservices are fundamentally different deployment topologies. They are mutually exclusive.",
        resolution: "If you start with a monolith, plan extraction boundaries and strangler-fig migration. If going microservices, accept the operational complexity.",
      },
    ],
  },
  {
    domain: "service-architecture",
    pattern: "microservices",
    conflicts_with: [
      {
        domain: "service-architecture",
        pattern: "modular_monolith",
        severity: "critical",
        description: "Microservices and modular monolith are mutually exclusive deployment topologies.",
        resolution: "See modular_monolith entry for migration guidance.",
      },
    ],
  },
  {
    domain: "state-management",
    pattern: "server_side_session",
    conflicts_with: [
      {
        domain: "authentication",
        pattern: "token_based_auth",
        severity: "warning",
        description: "Server-side sessions consume server memory and require session affinity or distributed session stores.",
        resolution: "Use stateless JWT tokens, or implement distributed session store (Redis, Memcached, DynamoDB).",
      },
    ],
  },
];

let _loadedRules: ConflictRule[] | null = null;
let _loadSource: "yaml" | "fallback" = "fallback";

function resolveConflictsPath(): string {
  const metaDir = dirname(fileURLToPath(import.meta.url));
  return join(metaDir, "..", "..", "pattern-conflicts.yaml");
}

function loadConflictRules(): ConflictRule[] {
  if (_loadedRules) return _loadedRules;

  const yamlPath = resolveConflictsPath();
  if (existsSync(yamlPath)) {
    try {
      const raw = yaml.load(readFileSync(yamlPath, "utf-8")) as ConflictFile;
      if (raw?.rules && Array.isArray(raw.rules)) {
        _loadedRules = raw.rules;
        _loadSource = "yaml";
        console.error(`[CrossDomain] Loaded ${raw.rules.length} conflict rules from pattern-conflicts.yaml`);
        return _loadedRules;
      }
    } catch {
      console.error("[CrossDomain] Failed to parse pattern-conflicts.yaml, using fallback rules");
    }
  }

  _loadedRules = FALLBACK_RULES;
  _loadSource = "fallback";
  return _loadedRules;
}

export function getConflictSource(): string {
  loadConflictRules();
  return _loadSource;
}

export function topologicalSort(domains: string[], loader: CookbookLoader): DomainOrder[] {
  const graph = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const domain of domains) {
    if (!graph.has(domain)) {
      graph.set(domain, []);
      inDegree.set(domain, 0);
    }
  }

  for (const domain of domains) {
    const entry = loader.getEntry(domain);
    if (!entry) continue;

    for (const prereq of (entry.meta.prerequisites ?? [])) {
      const prereqId = typeof prereq === "string" ? prereq : prereq.id;
      if (domains.includes(prereqId)) {
        graph.get(domain)!.push(prereqId);
      }
    }
  }

  for (const [, deps] of graph) {
    for (const dep of deps) {
      inDegree.set(dep, (inDegree.get(dep) || 0) + 1);
    }
  }

  const queue: string[] = [];
  for (const [domain, degree] of inDegree) {
    if (degree === 0) queue.push(domain);
  }

  const sorted: string[] = [];
  while (queue.length > 0) {
    const node = queue.shift()!;
    sorted.push(node);
    for (const dep of graph.get(node) ?? []) {
      const newDegree = (inDegree.get(dep) || 1) - 1;
      inDegree.set(dep, newDegree);
      if (newDegree === 0) queue.push(dep);
    }
  }

  for (const d of domains) {
    if (!sorted.includes(d)) sorted.push(d);
  }

  const depths = new Map<string, number>();
  for (const domain of sorted) {
    const deps = graph.get(domain) ?? [];
    if (deps.length === 0) {
      depths.set(domain, 0);
    } else {
      const maxDepDepth = Math.max(...deps.map(d => depths.get(d) ?? 0), -1);
      depths.set(domain, maxDepDepth + 1);
    }
  }

  return sorted.map(domain => ({
    domain,
    depth: depths.get(domain) ?? 0,
    depends_on: graph.get(domain) ?? [],
  }));
}

export function checkIncompatibilities(
  recommendations: Array<{ domain: string; pattern: string; pattern_name: string }>,
  loader: CookbookLoader
): ConflictWarning[] {
  const warnings: ConflictWarning[] = [];
  const rules = loadConflictRules();

  for (const rec of recommendations) {
    const rule = rules.find(
      r => r.domain === rec.domain && r.pattern === rec.pattern
    );
    if (!rule) continue;

    for (const conflict of rule.conflicts_with) {
      const conflictsInOther = recommendations.filter(
        r => r.domain === conflict.domain && r.pattern === conflict.pattern
      );
      for (const c of conflictsInOther) {
        warnings.push({
          domain_a: rec.domain,
          domain_b: c.domain,
          pattern_a: rec.pattern_name,
          pattern_b: c.pattern_name,
          severity: conflict.severity,
          description: conflict.description,
          resolution: conflict.resolution,
        });
      }
    }
  }

  for (const a of recommendations) {
    const entryA = loader.getEntry(a.domain);
    if (!entryA) continue;

    for (const rel of entryA.meta.related_standards ?? []) {
      if (rel.relationship !== "alternative") continue;

      const b = recommendations.find(r => r.domain === rel.id);
      if (!b) continue;

      const dup = warnings.some(
        w => w.domain_a === rel.id && w.domain_b === a.domain
      );
      if (!dup) {
        warnings.push({
          domain_a: a.domain,
          domain_b: b.domain,
          pattern_a: a.pattern_name,
          pattern_b: b.pattern_name,
          severity: "info",
          description: rel.context || `Patterns from '${a.domain}' and '${rel.id}' may conflict (marked as alternatives).`,
          resolution: "Evaluate tradeoffs between the two domains' recommendations.",
        });
      }
    }
  }

  return warnings;
}

export interface CrossDomainResult {
  domain_order: DomainOrder[];
  conflicts: ConflictWarning[];
  evaluation_order: string[];
  consistency_score: number;
}

export function resolveCrossDomain(
  recommendations: Recommendation[],
  loader: CookbookLoader
): CrossDomainResult {
  const domains = recommendations.map(r => r.domain);
  const domainOrder = topologicalSort(domains, loader);
  const evaluationOrder = domainOrder.map(d => d.domain);

  const recs = recommendations.map(r => ({
    domain: r.domain,
    pattern: r.pattern,
    pattern_name: r.pattern_name,
  }));

  const conflicts = checkIncompatibilities(recs, loader);

  let score = 1.0;
  for (const c of conflicts) {
    if (c.severity === "critical") score -= 0.5;
    else if (c.severity === "warning") score -= 0.2;
    else score -= 0.05;
  }
  score = Math.max(0, score);

  return {
    domain_order: domainOrder,
    conflicts,
    evaluation_order: evaluationOrder,
    consistency_score: score,
  };
}
