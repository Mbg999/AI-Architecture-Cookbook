# WebAssembly Frontend

Patterns for using WebAssembly in frontend apps — compute-intensive tasks, large data processing, modular integration, and Wasm module design.

## Decision Tree

```
Priority 1: IF compute_intensity == high                    → compute_intensive_wasm
Priority 2: IF data_volume in [medium, large] AND compute_intensity in [medium, high] → large_data_processing
Priority 3: IF js_interop_complexity == minimal              → pure_wasm_module
Priority 4: IF compute_intensity in [low, medium]            → standard_wasm_integration
FALLBACK → standard_wasm_integration
```

## Key Patterns

| Pattern | Use Case |
|---------|----------|
| **Compute-Intensive Wasm** | Image/video processing, crypto, physics |
| **Large Data Processing** | Client-side parsing, compression |
| **Pure Wasm Module** | Input → process → output, no DOM |
| **Standard Wasm Integration** | Lazy-loaded with JS fallback |

## Context Inputs

- `compute_intensity`: low / medium / high
- `data_volume`: small / medium / large
- `js_interop_complexity`: minimal / moderate / heavy
- `team_language`: js_only / multi_language

## Related Standards

- [frontend-build-performance](../frontend-build-performance/) — Wasm in bundle strategy
- [performance-optimization](../performance-optimization/) — Compute optimization

## Anti-Patterns

- Wasm for Everything
- No JS Fallback
- Tiny Computations in Wasm
