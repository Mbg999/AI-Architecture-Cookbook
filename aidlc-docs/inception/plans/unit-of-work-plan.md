# Unit of Work Plan — AI Architecture Cookbook

## Plan Overview
Decompose the AI Architecture Cookbook into units of work for the Construction phase. This is a content-generation project (not traditional software), so units align with content batches + tooling components.

---

## Plan Steps

- [x] **Step 1**: Define units of work with responsibilities and boundaries
- [x] **Step 2**: Define unit dependency matrix
- [x] **Step 3**: Map requirements to units (no user stories — mapping FR/NFR instead)
- [x] **Step 4**: Validate unit boundaries and completeness

---

## Questions

### Migration Strategy

## Question 1
The existing `authentication/authentication.yaml` is at root level. The new structure places it under `foundational/authentication/`. How should we handle this?

A) Move it now — relocate `authentication/` to `foundational/authentication/` during Units Generation
B) Move it during Code Generation Batch 1 — when we create the other foundational entries
C) Keep at root and symlink from `foundational/authentication/` (backward compatibility)

[Answer]: A

### Batch Execution Approach

## Question 2
The execution plan has 6 batches (Batch 1-5 = YAML entries, Batch 6 = distribution/governance). During Code Generation, should each batch be presented as a single unit for approval, or should you approve each individual entry within a batch?

A) Per-batch approval — you review all 6-7 entries in a batch at once, then approve the batch
B) Per-entry approval — you review and approve each YAML entry individually (33 approval cycles)
C) Auto-generate all — AI generates all entries, you review everything at the end

[Answer]: C

### Distribution Tooling Timing

## Question 3
Distribution components (MCP server, Skills, prompt system, validation tools) are in Batch 6 after all YAML entries. Should we build any tooling earlier?

A) Build validation tooling (schema.json + validate.py) in Batch 1 — use it to validate all subsequent batches
B) Keep all tooling in Batch 6 — generate everything at the end
C) Build validation in Batch 1, keep distribution (MCP, Skills, Prompts) in Batch 6

[Answer]: C

---
