# LLM Integration

Patterns for integrating Large Language Models into production applications — covering managed API usage, self-hosted inference, prompt engineering, cost control, guardrails, caching, and cascading fallbacks.

## Decision Tree

```
Priority 1: IF privacy_requirement == strict
              THEN → self_hosted_inference (local models)
              ELSE → standard_api_integration

Priority 2: IF cost_sensitivity == high AND expected_throughput in [high, very_high]
              THEN → managed_with_caching (semantic caching)

Priority 3: IF latency_requirement == realtime
              THEN → optimized_realtime (streaming, speculative decoding)
              ELSE → standard_api_integration

Priority 4: IF guardrails_required == true
              THEN → guarded_integration (input/output safety layers)

Priority 5: IF expected_throughput in [high, very_high]
              THEN → cascade_fallback (multi-provider redundancy)

FALLBACK → standard_api_integration
```

## Key Patterns

| Pattern | Use Case |
|---------|----------|
| **Standard API Integration** | Direct API call to managed LLM provider (OpenAI, Anthropic, Bedrock) |
| **Self-Hosted Inference** | On-prem LLM with vLLM, Ollama, TGI for data privacy |
| **Managed with Caching** | API + semantic cache for cost reduction |
| **Optimized Realtime** | Streaming, speculative decoding for interactive UX |
| **Guarded Integration** | Input/output guardrails for production safety |
| **Cascade Fallback** | Multi-model redundancy with graceful degradation |

## Context Inputs

- `model_source`: api_managed / self_hosted / hybrid
- `cost_sensitivity`: low / medium / high
- `latency_requirement`: realtime / interactive / batch
- `privacy_requirement`: strict / moderate / none
- `guardrails_required`: boolean
- `expected_throughput`: low / medium / high / very_high

## Related Standards

- [api-design](../../foundational/api-design/) — LLM integration follows API design patterns
- [rate-limiting](../../security-quality/rate-limiting/) — API calls must be rate-limited
- [secrets-management](../../foundational/secrets-management/) — Keys and credentials
- [error-handling](../../foundational/error-handling/) — Circuit breakers, retries, fallbacks
- [rag-architecture](../rag-architecture/) — RAG is key for grounding LLM responses

## Anti-Patterns

- Hardcoded API Keys and Config
- Unmonitored LLM Spend
- No Fallback Strategy
- No Input or Output Guardrails
- Always Using the Most Expensive Model
