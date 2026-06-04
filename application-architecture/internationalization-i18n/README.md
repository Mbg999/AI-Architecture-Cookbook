# Internationalization (i18n)

Patterns for multi-locale frontend apps — i18n frameworks, RTL support, SEO localization, translation management, and ICU message syntax.

## Decision Tree

```
Priority 1: IF locale_count > 5                   → multi_locale_architecture
Priority 2: IF rtl_support == true                → rtl_layout_support
Priority 3: IF seo_requirement == true            → seo_localized_routing
Priority 4: IF locale_count <= 5                  → standard_i18n_framework
FALLBACK → standard_i18n_framework
```

## Key Patterns

| Pattern | Use Case |
|---------|----------|
| **Standard i18n Framework** | 2-5 locales, JSON translation files |
| **Multi-Locale Architecture** | 5+ locales with automated translation pipelines |
| **RTL Layout Support** | Arabic, Hebrew, Persian, Urdu |
| **SEO Localized Routing** | Localized URLs with hreflang tags |

## Context Inputs

- `locale_count`: integer
- `translation_management`: manual / cms / crowdin / automated
- `rtl_support`: boolean
- `seo_requirement`: boolean

## Related Standards

- [frontend-state-management](../frontend-state-management/) — Locale persistence
- [responsive-mobile-first](../responsive-mobile-first/) — RTL layout handling

## Anti-Patterns

- Hardcoded Strings
- No RTL Testing
- Missing Fallback Locale
