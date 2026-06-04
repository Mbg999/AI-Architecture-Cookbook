# Frontend Component Architecture

Patterns for structuring UI components in modern frontend applications — atomic design, compound components, container/presentational separation, slot-based composition, headless UI, and component library architecture.

## Decision Tree

```
Priority 1: IF reuse_requirement in [multi_app, public_library]
              THEN → component_library_architecture

Priority 2: IF design_system_maturity == mature
              THEN → headless_ui_components

Priority 3: IF state_complexity == high
              THEN → container_presentational

Priority 4: IF rendering_approach in [ssr, isr]
              THEN → composition_via_slots

Priority 5: IF component_scale in [moderate, large]
              THEN → atomic_compound_components

FALLBACK → atomic_compound_components
```

## Key Patterns

| Pattern | Use Case |
|---------|----------|
| **Atomic + Compound Components** | Default for most apps: atoms → molecules → organisms, with implicit state via context |
| **Container / Presentational** | Separating data fetching (container) from rendering (presentational) |
| **Composition via Slots** | Layout components, shared shells, avoiding prop drilling |
| **Headless UI** | Custom design systems with baked-in accessibility (Radix, Headless UI) |
| **Component Library** | Sharing components across apps with tree-shaking, versioning, and docs |

## Context Inputs

- `component_scale`: small / moderate / large
- `design_system_maturity`: none / emerging / mature
- `rendering_approach`: csr / ssr / ssg / isr
- `state_complexity`: low / medium / high
- `team_size`: small / medium / large
- `reuse_requirement`: app / multi_app / public_library

## Related Standards

- [accessibility](../accessibility/) — ARIA, keyboard nav, WCAG
- [state-management](../state-management/) — Client-side state patterns
- [api-design](../api-design/) — API shape influences component boundaries

## Anti-Patterns

- Wrapper Hell
- God Component
- Prop Drilling Through 5+ Levels
- Not Wrapping Headless Primitives
