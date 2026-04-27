# MCP Server — AI Architecture Cookbook

This folder contains an MCP server that exposes the AI Architecture Cookbook via MCP tools and prompts.

What I fixed
- The `CookbookLoader` previously resolved the repo root incorrectly when running from `dist/` (it pointed at the `mcp-server/` folder), which caused the loader to produce an empty index and tools to return empty recommendations. I updated the loader to resolve the repository root robustly (walk up from `dist/` to the repo root) and rebuilt `dist/`.

Quick verification
1. Build the server:

```bash
cd mcp-server
npm install
npm run build
```

2. Run the small direct example (does not use MCP transport):

```bash
node examples/run-direct-nl.mjs
```

This will call the compiled `recommend-pattern-nl` implementation directly and print a JSON result with `parsed_args` and `recommendations`.

Alternatively, run the richer demo which submits a longer chat-app brief and prints enriched recommendations (one-line rationale, trade-offs, MVP/defer flags, and implementation guidelines):

```bash
node examples/demo-rich-recommend.mjs
```

The enriched recommendations include `one_line_rationale`, `tradeoffs` (pros/cons), `mvp` flags and `implementation_guidelines` when available in the cookbook entry.

Notes on the stdio transport example
- There are two example styles in `examples/`:
  - `run-direct-nl.mjs` — calls the compiled tools directly (recommended for quick debugging)
  - `stdio-client-nl.mjs` — attempts to spawn the MCP server and call the `recommend_pattern_nl` tool over stdio transport. If you see a timeout here, try the direct example first.

Next steps
- I added a TODO plan in the repository's todo list (audit + local plan). If you'd like, I can continue and fix the stdio transport example and add a small smoke-test that runs the server and verifies the tool over MCP transport.

Files touched
- `src/loader.ts` — fixed repo root resolution
- `dist/` — rebuilt (compiled artifacts)
- `examples/run-direct-nl.mjs` — added quick direct test
- `aidlc-docs/audit.md` — appended an audit entry for this issue

If you want, I can now:
- Fix and validate the `stdio` client example until it reliably calls the running MCP server, or
- Add an HTTP wrapper that exposes `recommend_pattern_nl` via a simple REST endpoint for easy testing.

Which should I do next?