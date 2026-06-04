# RAG Architecture

Retrieval-Augmented Generation (RAG) architectural patterns covering vector databases, embeddings, chunking strategies, re-ranking, hybrid search, grounding, and retrieval evaluation.

## Decision Tree

```
Priority 1: IF deployment_environment == embedded
              THEN → lightweight_rag (edge RAG with local models)
              ELSE → standard_rag

Priority 2: IF retrieval_scale in [large, very_large]
              THEN → clustered_vector_search (distributed vector DB)

Priority 3: IF grounding_requirement == strict
              THEN → hybrid_search_with_reranking (vector + BM25 + cross-encoder)

Priority 4: IF query_complexity == complex
              THEN → multi_stage_retrieval (query decomposition, fusion)

Priority 5: IF freshness_requirement == realtime
              THEN → streaming_rag (event-driven ingestion)
              ELSE → standard_rag

FALLBACK → standard_rag
```

## Key Patterns

| Pattern | Use Case |
|---------|----------|
| **Standard RAG** | Starting point for most RAG systems: chunk + embed + vector search + LLM |
| **Hybrid Search + Reranking** | Strict grounding requirements: vector + BM25 + cross-encoder |
| **Multi-Stage Retrieval** | Complex queries requiring query decomposition and fusion |
| **Streaming RAG** | Real-time document ingestion with event-driven indexing |
| **Clustered Vector Search** | Large-scale RAG with distributed vector DB cluster |
| **Lightweight RAG** | Edge/embedded deployment with local models |

## Context Inputs

- `retrieval_scale`: small / medium / large / very_large
- `query_complexity`: simple / moderate / complex
- `freshness_requirement`: realtime / near_realtime / periodic / batch
- `grounding_requirement`: strict / moderate / lenient
- `deployment_environment`: cloud / on_premises / hybrid / embedded
- `language_requirements`: single / multi / code

## Related Standards

- [search](../search/) — Vector search extends full-text search with semantic retrieval
- [data-persistence](../../foundational/data-persistence/) — Vector indexes are derived from data stores
- [data-transformation](../data-transformation/) — Documents must be chunked and transformed before embedding
- [performance-optimization](../../security-quality/performance-optimization/) — Retrieval latency directly impacts RAG response time

## Anti-Patterns

- RAG Without Evaluation
- Context Dumping Without Filtering
- Fixed-Size Character Chunking
- No Query Rewriting
- RAG as Silver Bullet
