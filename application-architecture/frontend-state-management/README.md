# Frontend State Management

Patterns for managing state in frontend applications — server state (caching, optimistic updates), global client state (stores), URL state, form state, and atomic/signal-based state.

## Decision Tree

```
Priority 1: IF state_type == form
              THEN → form_state

Priority 2: IF state_type in [server, mixed] AND real_time_needs == true
              THEN → server_state_query

Priority 3: IF state_type == url
              THEN → url_state

Priority 4: IF team_size in [medium, large] AND app_complexity in [moderate, complex]
              THEN → global_client_state

Priority 5: IF app_complexity == simple
              THEN → atomic_state

FALLBACK → server_state_query
```

## Key Patterns

| Pattern | Use Case |
|---------|----------|
| **Server State / Data Fetching** | API data with caching, refetching, optimistic updates |
| **Global Client State** | Shared app-wide state (theme, session) for medium-large teams |
| **URL State** | Shareable, bookmarkable filters, pagination, tabs |
| **Atomic State** | Fine-grained reactivity, derived state, minimal boilerplate |
| **Form State** | Form-specific state with validation, dirty tracking, wizards |

## Context Inputs

- `state_type`: server / global / url / form / mixed
- `app_complexity`: simple / moderate / complex
- `team_size`: small / medium / large
- `real_time_needs`: boolean
- `persistence_requirement`: none / session / local

## Related Standards

- [frontend-component-architecture](../frontend-component-architecture/) — State scoping in component hierarchy
- [api-design](../api-design/) — API contracts drive server state patterns
- [error-handling](../error-handling/) — Retry and rollback for state mutations

## Anti-Patterns

- Putting Everything in Global State
- Ignoring Stale-While-Revalidate
- Over-Normalizing Without Selectors
- Mixing Server and UI State in Same Store
