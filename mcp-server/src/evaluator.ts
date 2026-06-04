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
  // Additional explanatory fields
  one_line_rationale?: string;
  tradeoffs?: { pros: string[]; cons: string[] };
  mvp?: "MVP" | "defer" | "unknown";
  implementation_guidelines?: string[];
  // New scoring & explainability fields (Part 1 + Part 5)
  coverage_ratio?: number;
  inputs_provided?: number;
  inputs_total?: number;
  inputs_missing?: string[];
  inputs_used_defaults?: string[];
  alternatives_considered?: Alternative[];
  decision_rationale?: string;
  tech_stack_match?: { matched: boolean; tech_name?: string; implementation_ref?: string };
}

export interface Alternative {
  pattern: string;
  pattern_name: string;
  node_id: string;
  score: number;
  coverage_ratio: number;
  why_not_selected: string;
  tradeoffs?: { pros: string[]; cons: string[] };
}

export interface ScoredNodeResult {
  pattern: string;
  node_id: string;
  is_fallback: boolean;
  score: number;
  coverage_ratio: number;
  conditions_total: number;
  conditions_matched: number;
  conditions_missing: number;
  conditions_failed: number;
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

function evaluateSingleCondition(cond: string, ctx: EvalContext): { matched: boolean; missing: boolean } {
  const parsed = parseCondition(cond);
  if (!parsed) return { matched: false, missing: false };
  if (parsed.op === "AND") return { matched: true, missing: false };

  const ctxValue = ctx[parsed.field];
  if (ctxValue === undefined) return { matched: false, missing: true };

  const targetValue = resolveValue(parsed.value);
  const opFn = OPS[parsed.op];
  if (!opFn) return { matched: false, missing: false };

  return { matched: opFn(ctxValue, targetValue), missing: false };
}

/**
 * Legacy strict evaluation — all conditions must match exactly.
 * Kept for backward compatibility.
 */
export function evaluateNode(
  node: DecisionNode,
  ctx: EvalContext
): boolean {
  const conditions = node.if;
  for (const cond of conditions) {
    const parsed = parseCondition(cond);
    if (!parsed) return false;

    if (parsed.op === "AND") {
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

/**
 * Legacy strict decision tree — first matching node wins.
 * Kept for backward compatibility.
 */
export function evaluateDecisionTree(
  entry: CookbookEntry,
  ctx: EvalContext
): { pattern: string; node_id: string; is_fallback: boolean } {
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

  return {
    pattern: entry.decision_metadata.fallback.pattern,
    node_id: "fallback",
    is_fallback: true,
  };
}

/**
 * NEW: Score a single decision node based on how many conditions match
 * given the available context. Returns a scored result with coverage info.
 */
export function scoreNode(
  node: DecisionNode,
  ctx: EvalContext
): ScoredNodeResult {
  const conditions = node.if.filter(c => {
    const p = parseCondition(c);
    return p && p.op !== "AND";
  });

  const total = conditions.length;
  let matched = 0;
  let missing = 0;
  let failed = 0;

  for (const cond of conditions) {
    const result = evaluateSingleCondition(cond, ctx);
    if (result.missing) {
      missing++;
    } else if (result.matched) {
      matched++;
    } else {
      failed++;
    }
  }

  // Score: matched gets full weight, missing gets 0.3 (uncertainty), failed gets 0
  const score = total > 0
    ? (matched + missing * 0.3) / total
    : 0;

  const coverage_ratio = total > 0 ? (matched + failed) / total : 0;

  // Check else branch: if conditions fail (not just missing), consider else
  const hasElse = !!node.else;
  const elsePattern = hasElse && failed > 0 && matched === 0
    ? node.else!.pattern
    : null;

  return {
    pattern: elsePattern || node.then.pattern,
    node_id: elsePattern ? `${node.id}_else` : node.id,
    is_fallback: false,
    score,
    coverage_ratio,
    conditions_total: total,
    conditions_matched: matched,
    conditions_missing: missing,
    conditions_failed: failed,
  };
}

/**
 * NEW: Evaluate decision tree with scoring. Returns top match + all scored nodes
 * for alternatives consideration.
 */
export function evaluateDecisionTreeScored(
  entry: CookbookEntry,
  ctx: EvalContext
): {
  best: ScoredNodeResult;
  all: ScoredNodeResult[];
  is_fallback: boolean;
} {
  const sorted = [...entry.decision_tree].sort(
    (a, b) => a.priority - b.priority
  );

  const scored: ScoredNodeResult[] = sorted
    .map(node => scoreNode(node, ctx))
    .filter(r => r.score > 0 || r.conditions_matched > 0 || r.conditions_failed === 0);

  if (scored.length === 0) {
    return {
      best: {
        pattern: entry.decision_metadata.fallback.pattern,
        node_id: "fallback",
        is_fallback: true,
        score: 0,
        coverage_ratio: 0,
        conditions_total: 0,
        conditions_matched: 0,
        conditions_missing: 0,
        conditions_failed: 0,
      },
      all: [],
      is_fallback: true,
    };
  }

  // Sort by score descending, then by priority ascending as tiebreaker
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const aNode = entry.decision_tree.find(n => n.id === a.node_id.replace('_else', ''));
    const bNode = entry.decision_tree.find(n => n.id === b.node_id.replace('_else', ''));
    return (aNode?.priority ?? 999) - (bNode?.priority ?? 999);
  });

  return {
    best: scored[0],
    all: scored,
    is_fallback: false,
  };
}

/**
 * Compute dynamic confidence based on coverage ratio and decision_metadata.
 */
function computeDynamicConfidence(
  baseConfidence: string,
  coverage_ratio: number,
  inputsProvided: number,
  inputsTotal: number
): string {
  const confMap: Record<string, number> = { high: 3, medium: 2, low: 1 };
  const base = confMap[baseConfidence] ?? 2;

  // Reduce confidence when context is incomplete
  const inputRatio = inputsTotal > 0 ? inputsProvided / inputsTotal : 0;
  const effective = base * Math.min(coverage_ratio, inputRatio || 0.5);

  if (effective >= 2.4) return "high";
  if (effective >= 1.2) return "medium";
  return "low";
}

/**
 * Track which context_inputs were provided and which fell back to defaults.
 */
function analyzeInputs(
  entry: CookbookEntry,
  ctx: EvalContext
): { provided: number; total: number; missing: string[]; defaults: string[] } {
  const provided: string[] = [];
  const missing: string[] = [];
  const defaults: string[] = [];

  for (const input of entry.context_inputs) {
    if (ctx[input.name] !== undefined) {
      provided.push(input.name);
    } else if (input.default !== undefined && input.default !== null) {
      defaults.push(input.name);
    } else {
      missing.push(input.name);
    }
  }

  return {
    provided: provided.length,
    total: entry.context_inputs.length,
    missing,
    defaults,
  };
}

export function buildRecommendation(
  entry: CookbookEntry,
  ctx: EvalContext
): Recommendation {
  const scoredResult = evaluateDecisionTreeScored(entry, ctx);
  const result = scoredResult.best;
  const pattern = entry.patterns.find((p) => p.id === result.pattern);
  const checklist = entry.checklist ?? [];
  const inputs = analyzeInputs(entry, ctx);

  const patternData: any = pattern ?? {};

  const oneLineRationale =
    (Array.isArray(patternData.use_when) && patternData.use_when.length)
      ? String(patternData.use_when[0])
      : (typeof patternData.description === "string"
          ? String(patternData.description).split("\n")[0].trim()
          : "");

  const tradeoffs = {
    pros: Array.isArray(patternData.tradeoffs?.pros)
      ? patternData.tradeoffs.pros.map(String)
      : [],
    cons: Array.isArray(patternData.tradeoffs?.cons)
      ? patternData.tradeoffs.cons.map(String)
      : [],
  };

  const implementationGuidelines = Array.isArray(patternData.implementation?.guidelines)
    ? patternData.implementation.guidelines.map(String)
    : [];

  let mvp: "MVP" | "defer" | "unknown" = "unknown";
  const maturity = (patternData.maturity && patternData.maturity.level)
    ? String(patternData.maturity.level).toLowerCase()
    : "";
  const userCount = String(ctx["user_count"] ?? ctx["userCount"] ?? "");
  const scale = String(ctx["scale"] ?? "");
  if (maturity === "standard" || maturity === "best_practice" || maturity === "standard") {
    mvp = "MVP";
  } else if (maturity === "enterprise") {
    if (userCount === "massive" || scale === "enterprise") mvp = "MVP";
    else mvp = "defer";
  }

  // Build alternatives list from scored nodes (skip fallback)
  const alternatives: Alternative[] = [];
  const seenPatterns = new Set<string>();
  seenPatterns.add(result.pattern);

  for (const alt of scoredResult.all) {
    if (alt.node_id === result.node_id) continue;
    if (alt.is_fallback) continue;
    if (seenPatterns.has(alt.pattern)) continue;
    seenPatterns.add(alt.pattern);

    const altPattern = entry.patterns.find(p => p.id === alt.pattern) as any;
    const altTradeoffs = altPattern?.tradeoffs
      ? {
          pros: Array.isArray(altPattern.tradeoffs.pros)
            ? altPattern.tradeoffs.pros.map(String)
            : [],
          cons: Array.isArray(altPattern.tradeoffs.cons)
            ? altPattern.tradeoffs.cons.map(String)
            : [],
        }
      : undefined;

    alternatives.push({
      pattern: alt.pattern,
      pattern_name: altPattern ? String(altPattern.name) : alt.pattern,
      node_id: alt.node_id,
      score: alt.score,
      coverage_ratio: alt.coverage_ratio,
      why_not_selected: result.score > alt.score
        ? `Scored ${alt.score.toFixed(2)} vs best ${result.score.toFixed(2)} (coverage ${alt.coverage_ratio.toFixed(2)})`
        : `Lower priority than best match`,
      tradeoffs: (altTradeoffs?.pros.length || altTradeoffs?.cons.length) ? altTradeoffs : undefined,
    });
  }

  // Tech stack matching (Phase 3B)
  let techStackMatch: Recommendation["tech_stack_match"] = undefined;
  const rawTechStack = ctx["techStack"] ?? ctx["tech_stack"];
  const techStackEntries = Array.isArray(rawTechStack) ? rawTechStack : [];
  if (techStackEntries.length > 0 && Array.isArray(entry.tech_stack_mappings)) {
    const projectTechs = new Map<string, string>();
    for (const ts of techStackEntries as Array<{ layer: string; name: string }>) {
      projectTechs.set(ts.name.toLowerCase(), ts.layer);
    }
    for (const mapping of entry.tech_stack_mappings) {
      const techName = mapping.tech.name.toLowerCase();
      if (projectTechs.has(techName)) {
        const isSelectedPattern = mapping.pattern_id === result.pattern;
        if (isSelectedPattern) {
          techStackMatch = { matched: true, tech_name: mapping.tech.name, implementation_ref: mapping.implementation_ref };
        }
        // If there's a perfect tech match for a different pattern, boost it in rationale
      }
    }
    if (!techStackMatch) {
      techStackMatch = { matched: false };
    }
  }

  // Dynamic confidence based on coverage
  const dynamicConfidence = computeDynamicConfidence(
    entry.decision_metadata.confidence,
    result.coverage_ratio,
    inputs.provided,
    inputs.total
  );

  // Decision rationale as short string
  let decision_rationale: string;
  if (result.is_fallback) {
    decision_rationale = entry.decision_metadata.fallback.description;
  } else {
    const confLabel = dynamicConfidence;
    const covPct = Math.round(result.coverage_ratio * 100);
    decision_rationale = `Pattern '${patternData.name || result.pattern}' selected (confidence: ${confLabel}, coverage: ${covPct}%, ${inputs.provided}/${inputs.total} inputs provided).`;
    if (inputs.missing.length > 0) {
      decision_rationale += ` Missing inputs: ${inputs.missing.join(", ")}.`;
    }
    if (techStackMatch?.matched) {
      decision_rationale += ` Tech stack match: ${techStackMatch.tech_name}.`;
    } else if (techStackMatch && !techStackMatch.matched) {
      decision_rationale += ` No direct tech stack match found for this pattern.`;
    }
  }

  return {
    domain: entry.meta.domain,
    pattern: result.pattern,
    pattern_name: pattern ? String(pattern.name) : result.pattern,
    confidence: dynamicConfidence,
    matched_node: result.node_id,
    rationale: result.is_fallback
      ? entry.decision_metadata.fallback.description
      : `Scored ${result.score.toFixed(2)} with ${Math.round(result.coverage_ratio * 100)}% coverage`,
    checklist_summary: {
      critical: checklist.filter((c) => c.severity === "critical").length,
      high: checklist.filter((c) => c.severity === "high").length,
      total: checklist.length,
    },
    one_line_rationale: oneLineRationale || undefined,
    tradeoffs: (tradeoffs.pros.length || tradeoffs.cons.length) ? tradeoffs : undefined,
    implementation_guidelines: implementationGuidelines.length ? implementationGuidelines : undefined,
    mvp,
    // New Phase 1 fields
    coverage_ratio: result.coverage_ratio,
    inputs_provided: inputs.provided,
    inputs_total: inputs.total,
    inputs_missing: inputs.missing.length > 0 ? inputs.missing : undefined,
    inputs_used_defaults: inputs.defaults.length > 0 ? inputs.defaults : undefined,
    alternatives_considered: alternatives.length > 0 ? alternatives : undefined,
    decision_rationale,
    tech_stack_match: techStackMatch,
  };
}
