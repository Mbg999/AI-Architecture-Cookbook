# Responsive & Mobile-First Design

Patterns for responsive and mobile-first design — breakpoint strategies, fluid vs fixed layouts, adaptive vs responsive approaches, touch targets, and mobile UX.

## Decision Tree

```
Priority 1: IF primary_viewports == mobile_only       → mobile_first_approach
Priority 2: IF primary_viewports == desktop_only       → desktop_first_approach
Priority 3: IF content_complexity == completely_different → adaptive_design
Priority 4: IF primary_viewports == all AND layout_strategy == responsive → responsive_design
Priority 5: IF content_complexity == restructured      → adaptive_design
FALLBACK → responsive_design
```

## Key Patterns

| Pattern | Use Case |
|---------|----------|
| **Mobile-First** | Primary mobile audience, PWA, touch input |
| **Responsive (Fluid Grids)** | Multi-viewport, same content reflowing |
| **Adaptive (Distinct Layouts)** | Different content structure per viewport |
| **Desktop-First** | Complex dashboards, internal enterprise tools |

## Context Inputs

- `primary_viewports`: mobile_only / desktop_only / all
- `layout_strategy`: responsive / adaptive / hybrid
- `content_complexity`: same / restructured / completely_different
- `touch_target`: boolean

## Related Standards

- [accessibility](../accessibility/) — Touch targets, reflow
- [styling-design-systems](../styling-design-systems/) — Breakpoint tokens

## Anti-Patterns

- Tiny Touch Targets on Mobile
- Horizontal Scroll on Mobile
- Desktop-Only Testing
