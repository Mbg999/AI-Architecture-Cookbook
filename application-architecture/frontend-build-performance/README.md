# Frontend Build & Performance

Patterns for optimizing frontend builds — bundling, code splitting, tree shaking, vendor optimization, SSR builds, and Core Web Vitals.

## Decision Tree

```
Priority 1: IF bundle_size_target == strict                → aggressive_code_splitting
Priority 2: IF app_type in [ssr, ssg]                       → ssr_build_optimization
Priority 3: IF code_splitting_strategy == none AND app_type == spa → route_based_splitting
Priority 4: IF build_tool in [webpack, vite, rspack]         → vendor_dependency_optimization
Priority 5: IF app_type in [spa, pwa, ssr, ssg]              → build_tool_optimization
FALLBACK → route_based_splitting
```

## Key Patterns

| Pattern | Use Case |
|---------|----------|
| **Build Tool Optimization** | Faster dev builds, smaller production bundles |
| **Route-Based Splitting** | One chunk per route for SPA |
| **Aggressive Code Splitting** | < 100kB initial bundle budget |
| **Vendor Optimization** | Stable dependency chunk, deduplication |
| **SSR Build Optimization** | Server bundle size, streaming, ISR |

## Context Inputs

- `app_type`: spa / ssr / ssg / pwa
- `build_tool`: vite / webpack / parcel / turbopack / rspack
- `code_splitting_strategy`: none / route / component / vendor
- `bundle_size_target`: strict / medium / relaxed

## Related Standards

- [performance-optimization](../performance-optimization/) — General perf patterns
- [pwa-offline-first](../pwa-offline-first/) — Asset caching strategies

## Anti-Patterns

- No Code Splitting
- Loading Everything Eagerly
- No Bundle Analysis in CI
