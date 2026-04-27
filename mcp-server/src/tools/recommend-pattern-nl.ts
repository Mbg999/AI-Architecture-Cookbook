import { z } from "zod";
import type { CookbookLoader } from "../loader.js";
import { recommendPattern, recommendPatternSchema } from "./recommend-pattern.js";

export const recommendPatternNlSchema = z.object({
  text: z.string().describe("Natural language request describing the context and constraints"),
  format: z.enum(["human", "machine", "short"]).optional(),
  top: z.number().optional(),
  include_trace: z.boolean().optional(),
});

function tokenize(text: string) {
  // preserve hyphenated tokens but also emit decomposed forms
  const cleaned = text.replace(/[.,;:()\[\]"'`\\/]/g, " ");
  const raw = cleaned.split(/\s+/).map((t) => t.trim()).filter(Boolean);

  const stopwords = new Set([
    "the","and","or","for","a","an","to","of","in","on","at","by","as","is","are","that","this","it","we","our","you","your","has","have","be","with","from","but","if","else","which","per","per",
  ]);

  const tokens = new Set<string>();
  for (let i = 0; i < raw.length; i++) {
    const t = raw[i].toLowerCase();
    if (stopwords.has(t) || t.length < 2) continue;
    tokens.add(t);
    // add hyphen-free and underscore forms
    tokens.add(t.replace(/[-_]/g, ""));
    tokens.add(t.replace(/[-_]/g, " "));
    // add bigrams/trigrams
    if (i + 1 < raw.length) {
      const b = `${t} ${raw[i+1].toLowerCase()}`;
      if (!stopwords.has(raw[i+1].toLowerCase())) tokens.add(b);
      if (i + 2 < raw.length) {
        const tr = `${b} ${raw[i+2].toLowerCase()}`;
        if (!stopwords.has(raw[i+2].toLowerCase())) tokens.add(tr);
      }
    }
  }

  return Array.from(tokens).filter(Boolean);
}

const DEFAULT_SYNONYMS: Record<string, string[]> = {
  realtime: ["real-time","real_time","realtime","rt","low-latency","low latency"],
  e2ee: ["end-to-end","end to end","end-to-end-encryption","e2ee","e2e"],
  mau: ["monthly active users","mau"],
  postgres: ["postgresql","pg","postgres"],
  s3: ["s3","s3-compatible","object storage","object-storage"],
  auth: ["authentication","auth","login","sso","oauth","oidc"],
};

export function recommendPatternNl(loader: CookbookLoader, args: z.infer<typeof recommendPatternNlSchema>) {
  const rawText = (args.text || "").trim();
  const text = rawText.toLowerCase();

  // Quick JSON detection: if user passed an object, try to parse it
  if (text.includes("{") && text.includes("}")) {
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed === "object" && parsed !== null) {
        return { raw_args: parsed, result: recommendPattern(loader, parsed) };
      }
    } catch (e) {
      // fall through to heuristic parse
    }
  }

  const tokens = tokenize(text);
  const _args: any = { context: {} };

  // scale detection
  if (/\benterprise\b/.test(text) || /\blarge\b/.test(text)) _args.context.scale = "enterprise";
  else if (/\b(small|startup|proto|poc)\b/.test(text)) _args.context.scale = "small";

  // client types detection
  const clientTypes: string[] = [];
  if (tokens.some((t) => /\bweb\b/.test(t))) clientTypes.push("web");
  if (tokens.some((t) => /\bmobile\b/.test(t) || /android|ios/.test(t))) clientTypes.push("mobile");
  if (tokens.some((t) => /\bdesktop\b/.test(t))) clientTypes.push("desktop");
  if (tokens.some((t) => /\bapi\b/.test(t) || /backend\b/.test(t))) clientTypes.push("api");
  if (clientTypes.length) _args.context.client_types = Array.from(new Set(clientTypes));

  // auth/login
  if (tokens.some((t) => DEFAULT_SYNONYMS.auth.some((s) => t.includes(s)))) {
    _args.context.needs_login = true;
  }

  // realtime / low-latency
  if (tokens.some((t) => DEFAULT_SYNONYMS.realtime.some((s) => t.includes(s)) || /low[- ]?latenc/.test(t))) {
    _args.context.realtime = true;
  }

  // offline/sync
  if (tokens.some((t) => /offline|sync|synchron/i.test(t) || t.includes("local cache") || t.includes("local-cache"))) {
    _args.context.offline = true;
  }

  // attachments / media
  if (tokens.some((t) => /image|video|attachment|media|upload/.test(t))) {
    _args.context.attachments = true;
  }

  // push notifications
  if (tokens.some((t) => /push|apns|fcm|notification/.test(t))) {
    _args.context.push_notifications = true;
  }

  // GDPR / regulatory / sensitive data
  if (/\bgdpr\b/.test(text) || /compli/.test(text) || /regul/.test(text) || /personal data|sensitive data|pii/.test(text)) {
    _args.context.regulatory_required = true;
    _args.context.data_sensitivity = _args.context.data_sensitivity ?? "high";
  }

  // end-to-end encryption
  if (tokens.some((t) => DEFAULT_SYNONYMS.e2ee.some((s) => t.includes(s)) || /e2ee|end to end/.test(t))) {
    _args.context.end_to_end_encryption = true;
  }

  // tech preferences (DB, cache, object storage)
  if (tokens.some((t) => /postgres|postgresql|pg\b/.test(t))) _args.context.preferred_db = "postgresql";
  if (tokens.some((t) => /mongo|mongodb|cassandra|mysql/.test(t))) _args.context.preferred_db = _args.context.preferred_db ?? tokens.find((t) => /mongo|mongodb|cassandra|mysql/.test(t));
  if (tokens.some((t) => /redis|memcached|memcache/.test(t))) _args.context.preferred_cache = "redis";
  if (tokens.some((t) => /s3|minio|gcs|azure blob|object storage/.test(t))) _args.context.preferred_object_store = "s3";

  // user count hints
  const m = text.match(/(\d+(?:\.\d+)?)(\s*(k|m|million|thousand))/);
  if (m) {
    const val = Number(m[1]);
    const unit = (m[3] || "").toLowerCase();
    if (unit.includes("m") || unit.includes("million")) _args.context.user_count = "massive";
    else if (unit.includes("k") || unit.includes("thousand")) _args.context.user_count = "large";
  } else if (/\b(million|millions|massive|large)\b/.test(text)) {
    _args.context.user_count = "massive";
  }

  // Build domain scoring using index tag matching and searchByQuery recall
  const domainScores = new Map<string, number>();
  try {
    const idx = loader.getIndex();
    const allDomains = typeof loader.getAllDomains === "function" ? loader.getAllDomains() : [];
    const knownTags = new Set(Object.keys(idx.tag_index ?? {}));

    function incr(domain: string, by = 1) {
      domainScores.set(domain, (domainScores.get(domain) || 0) + by);
    }

    // 1) Tag matches (strong signal)
    for (const t of tokens) {
      if (knownTags.has(t)) {
        for (const d of idx.tag_index[t] ?? []) incr(d, 4);
      }
    }

    // 2) Synonym expansion: map token forms to canonical synonyms and match tags/domains
    for (const [canon, forms] of Object.entries(DEFAULT_SYNONYMS)) {
      for (const f of forms) {
        if (text.includes(f)) {
          if (knownTags.has(canon)) for (const d of idx.tag_index[canon] ?? []) incr(d, 3);
        }
      }
    }

    // 3) Per-token search recall (weaker signal)
    for (const t of tokens) {
      if (t.length < 2) continue;
      try {
        const hits = loader.searchByQuery(t) || [];
        for (const h of hits) incr(h.domain, 1);
      } catch (e) {
        // ignore
      }
    }

    // 4) Exact domain mentions (very strong)
    const explicit = Array.from(new Set((text.match(/\b[a-z][a-z0-9-]+\b/g) || []).map((s) => s.toLowerCase())));
    for (const w of explicit) {
      if (allDomains.includes(w)) incr(w, 6);
    }

    // build sorted domains
    const scored = Array.from(domainScores.entries()).sort((a, b) => b[1] - a[1]);
    if (scored.length) {
      _args.domains = scored.map((s) => s[0]).slice(0, 12);
    }
  } catch (e) {
    // ignore index errors
  }

  // fallback to free-text search if no domains selected
  if ((!_args.domains || !_args.domains.length) && typeof loader.searchByQuery === "function") {
    try {
      const hits = loader.searchByQuery(text || rawText) || [];
      if (hits && hits.length) _args.domains = hits.map((h) => h.domain).slice(0, 6);
    } catch (e) {
      // ignore
    }
  }

  // final fallback list
  if ((!_args.domains || !_args.domains.length) && typeof loader.getAllDomains === "function") {
    try {
      _args.domains = loader.getAllDomains().slice(0, 6);
    } catch (e) {
      // ignore
    }
  }

  // determine top-N from args or text
  let top = typeof args.top === 'number' ? args.top : 3;
  const topMatch = text.match(/top\s+(\d+)/);
  if (topMatch && typeof args.top !== 'number') top = Number(topMatch[1]);

  const result = recommendPattern(loader, _args as any);
  const recs = result.recommendations || [];

  // Rerank recommendations by combining pattern confidence with domainScore boosts
  const domainValues = Array.from(domainScores.values());
  const maxDomainScore = domainValues.length ? Math.max(...domainValues) : 1;

  const scored = recs.map((r) => {
    const domainBoost = domainScores.get(r.domain) || 0;
    const conf = Number((r.confidence ?? 0) as any) || 0;
    const score = conf + domainBoost / (maxDomainScore * 2);
    return { rec: r, score };
  });

  scored.sort((a, b) => Number(b.score) - Number(a.score));
  const sorted = scored.map((s) => s.rec);

  const topRecs = sorted.slice(0, Math.max(0, top)).map((r) => ({
    domain: r.domain,
    pattern: r.pattern_name,
    confidence: r.confidence,
    rationale: r.rationale,
    one_line_rationale: (r as any).one_line_rationale,
    tradeoffs: (r as any).tradeoffs,
    mvp: (r as any).mvp,
    implementation_guidelines: (r as any).implementation_guidelines,
  }));

  // optional decision traces
  let decision_traces: Record<string, unknown> | undefined = undefined;
  if (args.include_trace) {
    decision_traces = {};
    for (const r of sorted.slice(0, top)) {
      try {
        const e = loader.getEntry(r.domain);
        if (!e) continue;
        const node = e.decision_tree.find((n) => n.id === r.matched_node) ?? null;
        decision_traces[r.domain] = { matched_node: r.matched_node, node };
      } catch (e) {
        // ignore trace building errors
      }
    }
  }

  // tool invocation snippet for machine consumption
  const tool_invocation = {
    name: 'recommend_pattern',
    input: { context: _args.context, domains: _args.domains, format: args.format ?? 'human', include_trace: args.include_trace ?? false },
  };

  if (args.format === 'machine') {
    return { parsed_args: { original_text: rawText, tokens, context: _args.context, domains: _args.domains }, tool_invocation, recommendations: topRecs, decision_traces };
  }

  if (args.format === 'short') {
    return { recommendations: topRecs.map((r) => ({ domain: r.domain, pattern: r.pattern, one_line_rationale: r.one_line_rationale })) };
  }

  return {
    parsed_args: { original_text: rawText, tokens, context: _args.context, domains: _args.domains },
    tool_invocation,
    recommendations: topRecs,
    decision_traces,
    unmatched: result.unmatched_domains,
  };
}
