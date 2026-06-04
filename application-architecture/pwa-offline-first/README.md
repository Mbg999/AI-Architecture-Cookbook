# PWA & Offline-First

Patterns for progressive web apps and offline-first — service workers, caching strategies, background sync, app shell, install prompts.

## Decision Tree

```
Priority 1: IF offline_requirement == critical              → offline_first_architecture
Priority 2: IF sync_requirement == true                      → background_sync_queue
Priority 3: IF content_type == static                        → cache_first_static
Priority 4: IF offline_requirement in [important, optional]   → standard_pwa_setup
FALLBACK → standard_pwa_setup
```

## Key Patterns

| Pattern | Use Case |
|---------|----------|
| **Standard PWA Setup** | Basic offline with Stale-While-Revalidate |
| **Offline-First Architecture** | Full offline via IndexedDB + Background Sync |
| **Cache-First for Static** | Docs, images, fonts |
| **Background Sync Queue** | Offline mutations synced when online |

## Context Inputs

- `offline_requirement`: critical / important / optional / none
- `content_type`: static / dynamic / mixed
- `sync_requirement`: boolean

## Related Standards

- [frontend-build-performance](../frontend-build-performance/) — Precaching asset manifests
- [responsive-mobile-first](../responsive-mobile-first/) — PWA display modes

## Anti-Patterns

- No Offline Fallback
- Caching Everything Unconditionally
- No Cache Invalidation Strategy
