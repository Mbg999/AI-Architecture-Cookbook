# Frontend Testing

Patterns for testing frontend applications — component tests, E2E tests, visual regression, accessibility testing, and the testing pyramid.

## Decision Tree

```
Priority 1: IF app_criticality == critical    → full_testing_pyramid
Priority 2: IF testing_gap == accessibility   → accessibility_testing
Priority 3: IF testing_gap == visual           → visual_regression_testing
Priority 4: IF testing_gap == e2e              → e2e_testing
Priority 5: IF app_criticality in [standard, prototype] → component_integration_testing
FALLBACK → component_integration_testing
```

## Key Patterns

| Pattern | Use Case |
|---------|----------|
| **Component & Integration Testing** | Behavioral tests with Testing Library |
| **Full Testing Pyramid** | All test levels for critical apps |
| **Visual Regression** | CSS/style change detection |
| **Accessibility Testing** | axe-core automated audits |
| **E2E Testing** | Full user flows across the stack |

## Context Inputs

- `app_criticality`: prototype / standard / critical
- `team_experience`: beginner / moderate / expert
- `testing_gap`: unit / integration / visual / accessibility / e2e

## Related Standards

- [testing-strategies](../testing-strategies/) — General testing approaches
- [frontend-component-architecture](../frontend-component-architecture/) — Testable component design

## Anti-Patterns

- Testing Implementation Details
- Flaky E2E Tests Without Retries
- No Accessibility Tests
- Over-Mocking
