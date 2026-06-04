# AI Architecture Cookbook — Roadmap

## Estado del repo actual

- ✅ **48 estándares existentes** validados con `tools/validate.py` (0 errores, 0 warnings).
- ✅ `README.md`, `index.yaml`, `CLAUDE.md` sincronizados y con formato corregido.
- ✅ MCP server funcional con 5 herramientas (`query_standard`, `search_standards`, `get_checklist`, `get_decision_tree`, `recommend_pattern`).

---

## Propuestas de nuevos estándares

Cada estándar incluye: `README.md` (humano), `{domain}.yaml` (agente), validación con `tools/validate.py`, y actualización de `index.yaml`.

### 🔥 AI / ML / LLM (gap crítico — el repo es "AI Architecture" sin estándares de IA)

| # | Estándar | Descripción | Categoría | Estado |
|---|---|---|---|---|
| 44 | **rag-architecture** | Vector DBs, embeddings, chunking, re-ranking, retrieval híbrido, grounding, evaluación de retrieval | `integration-data` / `ai-ml` | ✅ Completado |
| 45 | **llm-integration** | Prompt engineering seguro, guardrails, fallback a modelos locales, cost control, token budgeting | `integration-data` / `ai-ml` | ✅ Completado |
| 46 | **ai-agent-architecture** | Agent loops, tool use (MCP/function calling), memoria corto/largo plazo, planificación, multi-agente | `application-architecture` | ✅ Completado |
| 47 | **vector-databases** | Pinecone, Weaviate, pgvector, Chroma, indexado, shardding, híbrido (vector + BM25) | `integration-data` | ✅ Completado |
| 48 | **model-serving-inference** | Batch vs real-time inference, modelo en edge, distilación, cuantización, serving platforms (Triton, vLLM) | `infrastructure` / `ai-ml` | ✅ Completado |
| 49 | **prompt-engineering-patterns** | Few-shot, chain-of-thought, ReAct, output parsing estructurado, sanitización de prompts | `application-architecture` | ⬜ Pendiente |

### 🏗️ Arquitectura & Plataforma (gaps enterprise tradicional)

| # | Estándar | Descripción | Categoría | Estado |
|---|---|---|---|---|
| 50 | **multi-tenancy** | Single-tenant vs multi-tenant, aislamiento de datos, tenant routing, cost attribution | `application-architecture` | ⬜ Pendiente |
| 51 | **workflow-orchestration** | Sagas, state machines, procesos asíncronos largos (Temporal, Camunda, Cadence, AWS Step Functions) | `application-architecture` | ⬜ Pendiente |
| 52 | **api-composition-bff** | Backend for Frontend, API Gateway composition, federated GraphQL, caché por cliente | `foundational` | ⬜ Pendiente |
| 53 | **event-sourcing-cqrs** | Event sourcing completo, snapshots, proyecciones, CQRS con separación read/write | `application-architecture` | ⬜ Pendiente |
| 54 | **caching-strategies** | In-memory, distributed, CDN, write-through, write-behind, cache stampede, stale-while-revalidate | `foundational` | ⬜ Pendiente |
| 55 | **data-resharding-partitioning** | Estrategias de particionamiento horizontal/vertical, re-sharding sin downtime, consistent hashing | `integration-data` | ⬜ Pendiente |

### ☁️ Infra, Operaciones & Seguridad Avanzada

| # | Estándar | Descripción | Categoría | Estado |
|---|---|---|---|---|
| 56 | **disaster-recovery-backup** | RPO/RTO, backup strategies, cross-region replication, disaster recovery drills | `infrastructure` | ⬜ Pendiente |
| 57 | **finops-cost-optimization** | Tagging, rightsizing, reservas, spot/preemptible, budgets, chargeback/showback | `infrastructure` | ⬜ Pendiente |
| 58 | **real-time-streaming** | Kafka, Pulsar, Flink, event time vs processing time, exactly-once, watermarks | `integration-data` | ⬜ Pendiente |
| 59 | **zero-trust-networking** | mTLS everywhere, identity-aware proxies, micro-segmentation, BeyondCorp | `security-quality` | ⬜ Pendiente |
| 60 | **observability-sre** | SLI/SLO/SLA, error budgets, SLO-driven alerting, on-call runbooks, incident management | `security-quality` | ⬜ Pendiente |

---

## Checklist de implementación por estándar

Cada estándar nuevo debe cumplir:

- [ ] Crear directorio `{category}/{domain}/`
- [ ] Escribir `{domain}.yaml` siguiendo `base-template.yaml` v3
  - [ ] `meta` (domain, version, tags, prerequisites, related_standards)
  - [ ] `context_inputs` (≥3 parámetros para decision tree)
  - [ ] `decision_tree` (≥3 reglas con prioridad)
  - [ ] `decision_metadata` (fallback, confidence, risk)
  - [ ] `patterns` (≥3 patrones con implementación)
  - [ ] `examples` (≥1 correcto, ≥1 incorrecto)
  - [ ] `security_hardening` (6 categorías)
  - [ ] `compliance` (RFCs, OWASP, GDPR, etc.)
  - [ ] `prompt_recipes` (≥4 recetas)
  - [ ] `anti_patterns` (≥3 anti-patrones con detección y migración)
  - [ ] `checklist` (≥5 items con severity)
- [ ] Escribir `README.md` para humanos (resumen, decision tree, patrones, ejemplos)
- [ ] Actualizar `{category}/_index.yaml`
- [ ] Actualizar `index.yaml` (regenerar con `python tools/generate-index.py`)
- [ ] Validar con `python tools/validate.py` (0 errores)
- [ ] Actualizar `README.md` principal si se menciona el nuevo estándar
- [ ] Actualizar `CLAUDE.md` si cambia el catálogo

---

## Dependencias entre estándares

```
rag-architecture ──> vector-databases
                ──> search
                ──> data-transformation

llm-integration ──> api-design
               ──> rate-limiting
               ──> secrets-management

ai-agent-architecture ──> llm-integration
                     ──> state-management
                     ──> messaging-events
                     ──> api-design

model-serving-inference ──> containerization
                         ──> orchestration
                         ──> cloud-architecture
                         ──> performance-optimization

prompt-engineering-patterns ──> input-validation
                           ──> api-design

caching-strategies ──> data-persistence
                  ──> performance-optimization
                  ──> api-design

event-sourcing-cqrs ──> messaging-events
                   ──> data-persistence

api-composition-bff ──> api-design
                     ──> api-gateway-edge-security
                     ──> authentication

workflow-orchestration ──> messaging-events
                        ──> error-handling
                        ──> state-management

multi-tenancy ──> authentication
             ──> authorization
             ──> data-persistence
             ──> api-design

real-time-streaming ──> messaging-events
                   ──> data-transformation
                   ──> performance-optimization

data-resharding-partitioning ──> data-persistence
                            ──> database-migration

observability-sre ──> logging-observability
                   ──> testing-strategies

zero-trust-networking ──> api-gateway-edge-security
                       ──> authentication
                       ──> secrets-management
                       ──> encryption
```

---

## Progreso

- **Total existentes**: 48/48 ✅
- **Total propuestos**: 12
- **Implementados**: 5
- **En progreso**: 0
- **Pendientes**: 12

Última actualización: 2026-06-04
