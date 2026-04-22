import type { CookbookEntry, DecisionNode } from "./loader.js";

export interface EvalContext {
  [key: string]: unknown;
}

export interface Recommendation {
  domain: string;
  pattern: string;
  pattern_name: string;
  confidence: string;
  matched_node: string;
  rationale: string;
  checklist_summary: { critical: number; high: number; total: number };
}

const OPS: Record<string, (left: unknown, right: unknown) => boolean> = {
  "==": (l, r) => String(l) === String(r),
  "!=": (l, r) => String(l) !== String(r),
  ">": (l, r) => Number(l) > Number(r),
  "<": (l, r) => Number(l) < Number(r),
  ">=": (l, r) => Number(l) >= Number(r),
  "<=": (l, r) => Number(l) <= Number(r),
  in: (l, r) => {
    if (Array.isArray(r)) return r.map(String).includes(String(l));
    return String(r).split(",").map((s) => s.trim()).includes(String(l));
  },
  not_in: (l, r) => {
    if (Array.isArray(r)) return !r.map(String).includes(String(l));
    return !String(r).split(",").map((s) => s.trim()).includes(String(l));
  },
};

function parseCondition(cond: string): { field: string; op: string; value: string } | null {
  // Match patterns like: "field == value", "field in [a, b]", "field not_in [x]"
  const match = cond.match(
    /^(\w+)\s+(==|!=|>=|<=|>|<|in|not_in|AND)\s+(.+)$/
  );
  if (!match) return null;
  return { field: match[1], op: match[2], value: match[3] };
}

function resolveValue(raw: string): unknown {
  const trimmed = raw.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return trimmed
      .slice(1, -1)
      .split(",")
      .map((s) => s.trim().replace(/^["']|["']$/g, ""));
  }
  if (!isNaN(Number(trimmed)) && trimmed !== "") return Number(trimmed);
  return trimmed.replace(/^["']|["']$/g, "");
}

export function evaluateNode(
  node: DecisionNode,
  ctx: EvalContext
): boolean {
  const conditions = node.if;
  for (const cond of conditions) {
    const parsed = parseCondition(cond);
    if (!parsed) return false;

    if (parsed.op === "AND") {
      // AND joins two sub-conditions — both sides must be true
      // In practice, multiple conditions in the array are already ANDed
      continue;
    }

    const ctxValue = ctx[parsed.field];
    if (ctxValue === undefined) return false;

    const targetValue = resolveValue(parsed.value);
    const opFn = OPS[parsed.op];
    if (!opFn) return false;
    if (!opFn(ctxValue, targetValue)) return false;
  }
  return true;
}

export function evaluateDecisionTree(
  entry: CookbookEntry,
  ctx: EvalContext
): { pattern: string; node_id: string; is_fallback: boolean } {
  // Sort by priority ascending
  const sorted = [...entry.decision_tree].sort(
    (a, b) => a.priority - b.priority
  );

  for (const node of sorted) {
    if (evaluateNode(node, ctx)) {
      return {
        pattern: node.then.pattern,
        node_id: node.id,
        is_fallback: false,
      };
    }
  }

  // No match — use fallback
  return {
    pattern: entry.decision_metadata.fallback.pattern,
    node_id: "fallback",
    is_fallback: true,
  };
}

export function buildRecommendation(
  entry: CookbookEntry,
  ctx: EvalContext
): Recommendation {
  const result = evaluateDecisionTree(entry, ctx);
  const pattern = entry.patterns.find((p) => p.id === result.pattern);
  const checklist = entry.checklist ?? [];

  return {
    domain: entry.meta.domain,
    pattern: result.pattern,
    pattern_name: pattern ? String(pattern.name) : result.pattern,
    confidence: entry.decision_metadata.confidence,
    matched_node: result.node_id,
    rationale: result.is_fallback
      ? entry.decision_metadata.fallback.description
      : `Matched decision node '${result.node_id}'`,
    checklist_summary: {
      critical: checklist.filter((c) => c.severity === "critical").length,
      high: checklist.filter((c) => c.severity === "high").length,
      total: checklist.length,
    },
  };
}
