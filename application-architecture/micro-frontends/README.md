# Micro-Frontends

Patterns for decomposing frontend monoliths into independently deployed micro-frontends — module federation, router orchestration, iframe composition, server-side composition, and Web Components.

## Decision Tree

```
Priority 1: IF isolation_requirement == strict
              THEN → iframe_composition

Priority 2: IF integration_approach in [server, hybrid]
              THEN → server_side_composition

Priority 3: IF framework_heterogeneity in [mixed, polyglot]
              THEN → web_components_composition

Priority 4: IF team_count > 3
              THEN → module_federation

Priority 5: IF team_count >= 2 AND integration_approach == client
              THEN → router_orchestration

FALLBACK → router_orchestration
```

## Key Patterns

| Pattern | Use Case |
|---------|----------|
| **Module Federation** | Independent deploys, 3+ teams, shared deps as singletons |
| **Router Orchestration** | Starting with MFs, Small SPA orchestration |
| **Iframe Composition** | Strict isolation, third-party or legacy content |
| **Server-Side Composition** | SSR-first, SEO-critical, enterprise portals |
| **Web Components** | Polyglot environment, framework-agnostic MFs |

## Context Inputs

- `team_count`: integer
- `integration_approach`: client / server / hybrid
- `deployment_frequency`: daily / weekly / monthly
- `framework_heterogeneity`: single / mixed / polyglot
- `isolation_requirement`: low / moderate / strict
- `shared_dependency_strategy`: singleton / versioned / no_sharing

## Related Standards

- [frontend-component-architecture](../frontend-component-architecture/) — Each MF uses component patterns internally
- [frontend-build-performance](../frontend-build-performance/) — Module federation impacts bundling
- [api-gateway-edge-security](../api-gateway-edge-security/) — Routing to correct MF origin

## Anti-Patterns

- Too Many Micro-Frontends
- Shared UI in Every MF
- Cross-MF Tight Coupling
- No Shared Dependency Strategy
