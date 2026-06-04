# Vector Databases

Vector database selection and architecture patterns covering index types (HNSW, IVF, PQ), embedding dimensions, sharding, hybrid search, multi-tenancy, and provider comparison.

## Decision Tree

```
Priority 1: IF recall_requirement == exact
              THEN → exact_nearest_neighbor (brute-force)

Priority 2: IF vector_count == billion_scale
              THEN → distributed_vector_db (cluster)

Priority 3: IF deployment_model == managed AND vector_count in [small, medium]
              THEN → managed_vector_db (Pinecone, Weaviate Cloud)

Priority 4: IF deployment_model == embedded
              THEN → embedded_vector_db (sqlite-vss, LanceDB, Chroma)

Priority 5: IF hybrid_search_required == true
              THEN → hybrid_capable_db (Weaviate, Qdrant, pgvector)

Priority 6: IF vector_count in [large, very_large]
              THEN → distributed_vector_db (Milvus, Qdrant, Weaviate cluster)

FALLBACK → managed_vector_db
```

## Key Patterns

| Pattern | Use Case |
|---------|----------|
| **Managed Vector DB** | Small-medium scale, zero ops (Pinecone, Weaviate Cloud) |
| **Distributed Vector DB** | Large scale, HA, multi-tenant (Milvus, Qdrant, Weaviate) |
| **Embedded Vector DB** | Edge, local dev, privacy-first (sqlite-vss, LanceDB, Chroma) |
| **Hybrid Capable DB** | Need vector + BM25 search in one system |
| **Exact Nearest Neighbor** | Small datasets requiring 100% recall |

## Context Inputs

- `vector_count`: small / medium / large / very_large / billion_scale
- `embedding_dimensions`: small_384 / medium_768 / large_1536 / very_large_3072
- `latency_requirement`: realtime / interactive / batch
- `recall_requirement`: standard / high / exact
- `hybrid_search_required`: boolean
- `deployment_model`: embedded / managed / self_hosted

## Related Standards

- [rag-architecture](../rag-architecture/) — Primary consumer of vector databases
- [search](../search/) — Vector search complements full-text search
- [data-persistence](../../foundational/data-persistence/) — Vector DBs are a data persistence layer

## Anti-Patterns

- Vector Database as General-Purpose Database
- Ignoring Recall Quality
- Wrong Distance Metric
- One-Shard-for-All
