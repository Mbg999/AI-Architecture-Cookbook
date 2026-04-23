#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CookbookLoader } from "./loader.js";
import { queryStandard, queryStandardSchema } from "./tools/query-standard.js";
import { searchStandards, searchStandardsSchema } from "./tools/search-standards.js";
import { getChecklist, getChecklistSchema } from "./tools/get-checklist.js";
import { getDecisionTree, getDecisionTreeSchema } from "./tools/get-decision-tree.js";
import { recommendPattern, recommendPatternSchema } from "./tools/recommend-pattern.js";

const loader = new CookbookLoader();

const server = new McpServer({
  name: "ai-architecture-cookbook",
  version: "1.0.0",
});

server.registerTool(
  "query_standard",
  {
    description: "Returns the full YAML content for a given architectural standard. Use when you need complete details about a specific domain (patterns, decision tree, checklist, examples).",
    inputSchema: queryStandardSchema,
    annotations: { readOnlyHint: true },
  },
  async (args) => ({
    content: [{ type: "text" as const, text: JSON.stringify(queryStandard(loader, args), null, 2) }],
  })
);

server.registerTool(
  "search_standards",
  {
    description: "Search cookbook entries by tags, categories, or free-text query. Use to discover which standards are relevant for a given task.",
    inputSchema: searchStandardsSchema,
    annotations: { readOnlyHint: true },
  },
  async (args) => ({
    content: [{ type: "text" as const, text: JSON.stringify(searchStandards(loader, args), null, 2) }],
  })
);

server.registerTool(
  "get_checklist",
  {
    description: "Returns the verification checklist for a standard. Use after implementing a pattern to verify compliance. Optionally filter by severity.",
    inputSchema: getChecklistSchema,
    annotations: { readOnlyHint: true },
  },
  async (args) => ({
    content: [{ type: "text" as const, text: JSON.stringify(getChecklist(loader, args), null, 2) }],
  })
);

server.registerTool(
  "get_decision_tree",
  {
    description: "Returns the decision tree and context inputs for a standard. Use to understand what factors determine which pattern to recommend.",
    inputSchema: getDecisionTreeSchema,
    annotations: { readOnlyHint: true },
  },
  async (args) => ({
    content: [{ type: "text" as const, text: JSON.stringify(getDecisionTree(loader, args), null, 2) }],
  })
);

server.registerTool(
  "recommend_pattern",
  {
    description: "Provide context about your project and get pattern recommendations. Evaluates decision trees across relevant standards and returns ranked recommendations.",
    inputSchema: recommendPatternSchema,
    annotations: { readOnlyHint: true },
  },
  async (args) => ({
    content: [{ type: "text" as const, text: JSON.stringify(recommendPattern(loader, args), null, 2) }],
  })
);

async function main() {
  const transport = new StdioServerTransport();
  console.log('Starting MCP server "ai-architecture-cookbook"...');
  await server.connect(transport);
  console.log('MCP server "ai-architecture-cookbook" is running');
}

main().catch((err) => {
  console.error("Server error:", err);
  process.exit(1);
});
