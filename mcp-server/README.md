# MCP Server — AI Architecture Cookbook

Source code for the `@ai-architecture-cookbook/mcp-server` npm package.

## Usage

Via **npx** — no local installation required:

```bash
npx -y @ai-architecture-cookbook/mcp-server
```

Configure your AI assistant with:

```
command: "npx"
args: ["-y", "@ai-architecture-cookbook/mcp-server"]
```

## Local Development

```bash
npm install
npm run build
npm run dev    # watch mode (auto-rebuild on changes)
```

### Examples

```bash
# Direct NL call (bypasses MCP transport)
node examples/run-direct-nl.mjs

# Full recommendation demo with trade-offs
node examples/demo-rich-recommend.mjs

# Stdio client (spawns the server automatically)
node examples/stdio-client.mjs

# HTTP wrapper (exposes MCP tools via REST)
node examples/http-wrapper.mjs
```

### Prerequisites

- Node >= 18 (LTS recommended)

## Publishing

```bash
npm version patch   # or minor, major
npm publish
```

Published as `@ai-architecture-cookbook/mcp-server` on npm.
