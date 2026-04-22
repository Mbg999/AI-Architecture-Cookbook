# Cycle 4 — README Generation Questions

Please answer the following questions to help define the README.md format and content level.

## Question 1
The existing authentication/README.md is a lightweight summary (~30 lines). How detailed should each README be?

A) Lightweight summary (current style) — purpose, decision tree snapshot, when-to-use, top checklist items, links
B) Medium detail — add pattern descriptions with use_when/avoid_when, full checklist, anti-patterns list, and related standards
C) Comprehensive — full human-readable rendering of the YAML: all patterns with tradeoffs, implementation guidelines, examples (correct/incorrect), security hardening, compliance references, and prompt recipes
D) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 2
Should each README include the code examples (correct vs incorrect pseudocode) from the `examples` section of each YAML?

A) Yes — include all examples with correct/incorrect code and explanations (helps developers understand patterns quickly)
B) No — just reference "see examples in the YAML" to keep README concise
C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
Should the README include a visual decision tree (Mermaid diagram) or keep it as a text list like the current authentication README?

A) Mermaid flowchart — visual decision tree rendered in GitHub
B) Text list — simple priority-ordered list (current style)
C) Both — Mermaid diagram with text fallback
D) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 4
The existing authentication README says "Summary" in the title. What title format should we standardize?

A) `# {Domain Name} — Summary` (current style)
B) `# {Domain Name}` (clean, simple)
C) `# {Domain Name} — AI Architecture Cookbook` (branded)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 5
Extensions are already enabled from Cycle 1 (Security Baseline: Yes, Property-Based Testing: Yes). Should we carry those forward as-is?

A) Yes — same extension configuration
B) No — disable extensions for this documentation-only cycle
C) Other (please describe after [Answer]: tag below)

[Answer]: A
