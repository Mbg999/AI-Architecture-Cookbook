# Form Handling Patterns

Patterns for frontend form handling — validation UX, multi-step wizards, autosave, form state management, and accessibility.

## Decision Tree

```
Priority 1: IF form_complexity == wizard              → wizard_form_pattern
Priority 2: IF form_complexity == complex              → complex_form_management
Priority 3: IF draft_persistence == true               → autosave_draft
Priority 4: IF form_complexity == simple               → simple_form_management
FALLBACK → simple_form_management
```

## Key Patterns

| Pattern | Use Case |
|---------|----------|
| **Simple Form** | 2-10 fields, basic validation |
| **Complex Form** | 10+ fields, conditional logic, field arrays |
| **Wizard Form** | Multi-step forms with progress tracking |
| **Autosave Draft** | Long forms persisting to localStorage |

## Context Inputs

- `form_complexity`: simple / complex / wizard
- `validation_approach`: submit / blur / change / realtime
- `async_validation`: boolean
- `draft_persistence`: boolean

## Related Standards

- [input-validation](../input-validation/) — Backend input validation rules
- [frontend-state-management](../frontend-state-management/) — Form state as specialized state

## Anti-Patterns

- Validate Only on Submit
- No Autosave for Long Forms
- Overwhelming Error Display
