# Styling & Design Systems

Patterns for styling architecture and design systems — utility-first CSS, CSS Modules/BEM, design tokens, multi-theme support, and accessible visual design.

## Decision Tree

```
Priority 1: IF branding_count > 1 AND team_size in [medium, large]  → design_tokens_css_custom_properties
Priority 2: IF design_system_maturity == mature                      → utility_first_tailwind
Priority 3: IF accessibility_target in [aa, aaa]                     → accessible_visual_design
Priority 4: IF design_system_maturity == emerging                    → css_modules_bem
Priority 5: IF team_size == small                                    → utility_first_tailwind
FALLBACK → css_modules_bem
```

## Key Patterns

| Pattern | Use Case |
|---------|----------|
| **Utility-First (Tailwind)** | Rapid dev with built-in design constraints |
| **CSS Modules + BEM** | Scoped, predictable traditional CSS |
| **Design Tokens + CSS Custom Properties** | Multi-brand / multi-theme enterprise |
| **Accessible Visual Design** | WCAG AA/AAA compliant styling |

## Context Inputs

- `team_size`: small / medium / large
- `design_system_maturity`: none / emerging / mature
- `styling_approach`: utility / css_modules / css_in_js / css_layers
- `branding_count`: integer
- `accessibility_target`: none / aa / aaa

## Related Standards

- [frontend-component-architecture](../frontend-component-architecture/) — Components consume design tokens
- [accessibility](../accessibility/) — WCAG and ARIA requirements
- [responsive-mobile-first](../responsive-mobile-first/) — Breakpoint tokens

## Anti-Patterns

- No Design Tokens
- IdSelectors in CSS Modules
- Inconsistent Utility Usage
- Global CSS Overrides for Every Theme
