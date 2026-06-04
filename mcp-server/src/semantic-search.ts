import type { CookbookLoader, CookbookIndex, IndexEntry } from "./loader.js";

interface Document {
  domain: string;
  tokens: string[];
  vector: Map<string, number>;
}

const STOPWORDS = new Set([
  "the","and","or","for","a","an","to","of","in","on","at","by","as","is","are",
  "that","this","it","we","our","you","your","has","have","be","with","from","but",
  "if","else","which","per","not","no","all","can","use","using","used","both",
  "each","most","some","such","than","them","these","they","was","will","would",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, " ")
    .split(/\s+/)
    .map(t => t.trim())
    .filter(t => t.length >= 2 && !STOPWORDS.has(t));
}

function buildTf(terms: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of terms) {
    tf.set(t, (tf.get(t) || 0) + 1);
  }
  const max = Math.max(...tf.values(), 1);
  for (const [k, v] of tf) {
    tf.set(k, v / max);
  }
  return tf;
}

function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0, normA = 0, normB = 0;

  for (const [k, v] of a) {
    normA += v * v;
    const bv = b.get(k) || 0;
    dot += v * bv;
  }

  for (const v of b.values()) {
    normB += v * v;
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

export class TfIdfIndex {
  private docs: Document[] = [];
  private idf = new Map<string, number>();
  private built = false;

  build(loader: CookbookLoader): void {
    const index = loader.getIndex();
    const allDocs: Document[] = [];

    for (const cat of index.categories) {
      for (const entry of cat.entries) {
        let text = `${entry.domain} ${entry.description} ${entry.tags.join(" ")}`;

        const fullEntry = loader.getEntry(entry.domain);
        if (fullEntry) {
          for (const rawPattern of fullEntry.patterns) {
            const pData = rawPattern as Record<string, unknown>;
            if (typeof pData.description === "string") text += " " + pData.description;
            if (Array.isArray(pData.use_when)) text += " " + (pData.use_when as string[]).join(" ");
            if (Array.isArray(pData.avoid_when)) text += " " + (pData.avoid_when as string[]).join(" ");
          }
        }

        const tokens = tokenize(text);
        const tf = buildTf(tokens);
        allDocs.push({ domain: entry.domain, tokens, vector: tf });
      }
    }

    const N = allDocs.length;
    const docFreq = new Map<string, number>();
    for (const doc of allDocs) {
      const seen = new Set(doc.tokens);
      for (const t of seen) {
        docFreq.set(t, (docFreq.get(t) || 0) + 1);
      }
    }

    for (const [term, df] of docFreq) {
      this.idf.set(term, Math.log((N + 1) / (df + 1)) + 1);
    }

    for (const doc of allDocs) {
      const tfidf = new Map<string, number>();
      for (const [term, tf] of doc.vector) {
        const idfVal = this.idf.get(term) || 1;
        tfidf.set(term, tf * idfVal);
      }
      doc.vector = tfidf;
    }

    this.docs = allDocs;
    this.built = true;
  }

  search(query: string, topK = 10): Array<{ domain: string; score: number }> {
    if (!this.built) return [];

    const queryTokens = tokenize(query);
    if (queryTokens.length === 0) return [];

    const queryTf = buildTf(queryTokens);
    const queryVector = new Map<string, number>();
    for (const [term, tf] of queryTf) {
      const idfVal = this.idf.get(term) || 1;
      queryVector.set(term, tf * idfVal);
    }

    const scored = this.docs
      .map(doc => ({
        domain: doc.domain,
        score: cosineSimilarity(doc.vector, queryVector),
      }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return scored;
  }

  combinedSearch(
    loader: CookbookLoader,
    query: string,
    topK = 10,
    options?: { tags?: string[]; categories?: string[] }
  ): Array<{ domain: string; category: string; description: string; version: string; tags: string[]; path: string; score: number }> {
    const index = loader.getIndex();

    let entries: Array<IndexEntry & { category: string }> = index.categories.flatMap(c =>
      c.entries.map(e => ({ ...e, category: c.id }))
    );

    if (options?.tags?.length) {
      const tagSet = new Set(loader.searchByTags(options.tags).map(e => e.domain));
      entries = entries.filter(e => tagSet.has(e.domain));
    }
    if (options?.categories?.length) {
      const catSet = new Set(options.categories);
      entries = entries.filter(e => catSet.has(e.category));
    }

    const q = query.toLowerCase();

    const literalScores = new Map<string, number>();
    for (const e of entries) {
      let score = 0;
      if (e.domain.includes(q)) score += 2;
      if (e.description.toLowerCase().includes(q)) score += 1;
      if (e.tags.some(t => t.includes(q))) score += 0.5;
      if (score > 0) literalScores.set(e.domain, score);
    }

    const semanticResults = this.search(query, topK * 2);
    const semanticScores = new Map(semanticResults.map(r => [r.domain, r.score]));

    const maxLiteral = Math.max(...literalScores.values(), 1);
    const maxSemantic = Math.max(...semanticScores.values(), 1);

    const combined = entries.map(e => {
      const literal = (literalScores.get(e.domain) || 0) / maxLiteral;
      const semantic = (semanticScores.get(e.domain) || 0) / maxSemantic;
      const hasAny = literalScores.size > 0 || semanticScores.size > 0;
      return { ...e, score: hasAny ? (semantic * 0.6 + literal * 0.4) : 0 };
    });

    return combined
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(r => ({
        domain: r.domain,
        category: r.category,
        description: r.description,
        version: r.version,
        tags: r.tags,
        path: r.path,
        score: Math.round(r.score * 1000) / 1000,
      }));
  }
}

let _index: TfIdfIndex | null = null;

export function getTfIdfIndex(loader: CookbookLoader): TfIdfIndex {
  if (!_index) {
    _index = new TfIdfIndex();
    _index.build(loader);
  }
  return _index;
}
