#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { CookbookLoader } from "./loader.js";

import { queryStandard, queryStandardSchema } from "./tools/query-standard.js";
import { searchStandards, searchStandardsSchema } from "./tools/search-standards.js";
import { getChecklist, getChecklistSchema } from "./tools/get-checklist.js";
import { getDecisionTree, getDecisionTreeSchema } from "./tools/get-decision-tree.js";
import { recommendPattern, recommendPatternSchema } from "./tools/recommend-pattern.js";
import { recommendPatternNl, recommendPatternNlSchema } from "./tools/recommend-pattern-nl.js";
import { promptRecipes, promptRecipesSchema } from "./tools/prompt-recipes.js";
import { recommendationContextInputSchema, validateRecommendationContext } from "./tools/collect-recommendation-context.js";
import { recommendWorkflow, recommendWorkflowSchema } from "./tools/recommend-workflow.js";

const loader = new CookbookLoader();

const server = new McpServer({
  name: "ai-architecture-cookbook",
  version: "1.0.1",
});

function safeStringify(obj: unknown) {
  const seen = new WeakSet();
  return JSON.stringify(obj, function (_key, value) {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return '[Circular]';
      seen.add(value as object);
    }
    return value;
  }, 2);
}

//
// =========================
// TOOLS
// =========================
//

server.registerTool(
  "query_standard",
  {
    description:
      "Returns the full YAML content for a given architectural standard.",
    inputSchema: queryStandardSchema,
    annotations: { readOnlyHint: true },
  },
  async (args) => {
    console.error('TOOL_INVOKED: query_standard', JSON.stringify(args));
    try {
      console.error('TOOL_COMPLETE: query_standard');
      return {
        content: [
          { type: "text", text: JSON.stringify(queryStandard(loader, args), null, 2) },
        ],
      };
    } catch (e) {
      console.error('TOOL_ERROR: query_standard', e);
      throw e;
    }
  }
);

server.registerTool(
  "search_standards",
  {
    description:
      "Search cookbook entries by tags, categories, or free-text query.",
    inputSchema: searchStandardsSchema,
    annotations: { readOnlyHint: true },
  },
  async (args) => {
    console.error('TOOL_INVOKED: search_standards', JSON.stringify(args));
    try {
      console.error('TOOL_COMPLETE: search_standards');
      return {
        content: [
          { type: "text", text: JSON.stringify(searchStandards(loader, args), null, 2) },
        ],
      };
    } catch (e) {
      console.error('TOOL_ERROR: search_standards', e);
      throw e;
    }
  }
);

server.registerTool(
  "get_checklist",
  {
    description: "Returns the verification checklist for a standard.",
    inputSchema: getChecklistSchema,
    annotations: { readOnlyHint: true },
  },
  async (args) => {
    console.error('TOOL_INVOKED: get_checklist', JSON.stringify(args));
    try {
      console.error('TOOL_COMPLETE: get_checklist');
      return {
        content: [
          { type: "text", text: JSON.stringify(getChecklist(loader, args), null, 2) },
        ],
      };
    } catch (e) {
      console.error('TOOL_ERROR: get_checklist', e);
      throw e;
    }
  }
);

server.registerTool(
  "get_decision_tree",
  {
    description:
      "Returns the decision tree and context inputs for a standard.",
    inputSchema: getDecisionTreeSchema,
    annotations: { readOnlyHint: true },
  },
  async (args) => {
    console.error('TOOL_INVOKED: get_decision_tree', JSON.stringify(args));
    try {
      console.error('TOOL_COMPLETE: get_decision_tree');
      return {
        content: [
          { type: "text", text: JSON.stringify(getDecisionTree(loader, args), null, 2) },
        ],
      };
    } catch (e) {
      console.error('TOOL_ERROR: get_decision_tree', e);
      throw e;
    }
  }
);

server.registerTool(
  "recommend_pattern",
  {
    description:
      "Provide structured context and get pattern recommendations.",
    inputSchema: recommendPatternSchema,
    annotations: { readOnlyHint: true },
  },
  async (args) => {
    console.error('TOOL_INVOKED: recommend_pattern', JSON.stringify(args));
    try {
      const res = recommendPattern(loader, args as any);
      // attach decision traces if requested
      if ((args as any).include_trace) {
        const traces: Record<string, unknown> = {};
        for (const r of res.recommendations) {
          try {
            const e = loader.getEntry(r.domain);
            if (!e) continue;
            const node = e.decision_tree.find((n) => n.id === r.matched_node) ?? null;
            traces[r.domain] = { matched_node: r.matched_node, node };
          } catch (e) {
            // ignore
          }
        }
        (res as any).decision_traces = traces;
      }

      console.error('TOOL_COMPLETE: recommend_pattern');
      return {
        content: [
          { type: "text", text: JSON.stringify(res, null, 2) },
        ],
      };
    } catch (e) {
      console.error('TOOL_ERROR: recommend_pattern', e);
      throw e;
    }
  }
);


server.registerTool(
  "prompt_recipes",
  {
    description: "Expose vetted prompt recipes and tool invocation snippets per domain or query.",
    inputSchema: promptRecipesSchema,
    annotations: { readOnlyHint: true },
  },
  async (args) => {
    console.error('TOOL_INVOKED: prompt_recipes', JSON.stringify(args));
    try {
      const res = promptRecipes(loader, args as any);
      console.error('TOOL_COMPLETE: prompt_recipes');
      return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
    } catch (e) {
      console.error('TOOL_ERROR: prompt_recipes', e);
      throw e;
    }
  }
);

server.registerTool(
  "recommend_pattern_nl",
  {
    description: "Natural-language wrapper for pattern recommendations.",
    inputSchema: recommendPatternNlSchema,
    annotations: { readOnlyHint: true },
  },
  async (args) => {
    console.error('TOOL_INVOKED: recommend_pattern_nl', JSON.stringify(args));
    try {
      console.error('TOOL_COMPLETE: recommend_pattern_nl');
      return {
        content: [
          { type: "text", text: JSON.stringify(recommendPatternNl(loader, args), null, 2) },
        ],
      };
    } catch (e) {
      console.error('TOOL_ERROR: recommend_pattern_nl', e);
      throw e;
    }
  }
);

// Validation / guided-collection tool: helps collect and validate recommendation inputs
server.registerTool(
  "validate_recommendation_context",
  {
    description: "Validate and collect missing fields for recommendation inputs.",
    inputSchema: recommendationContextInputSchema,
    annotations: { readOnlyHint: true },
  },
  async (args) => {
    console.error('TOOL_INVOKED: validate_recommendation_context', JSON.stringify(args));
    try {
      const res = validateRecommendationContext(args);
      console.error('TOOL_COMPLETE: validate_recommendation_context');
      return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
    } catch (e) {
      console.error('TOOL_ERROR: validate_recommendation_context', e);
      throw e;
    }
  }
);

// Orchestrator: compact recommendation workflow (validate -> recommend -> checklist/scaffold)
server.registerTool(
  "recommend_workflow",
  {
    description: "Orchestrated recommendation workflow: validate inputs, recommend patterns, attach traces/checklists, and optionally scaffold recipes.",
    inputSchema: recommendWorkflowSchema,
    annotations: { readOnlyHint: true },
  },
  async (args) => {
    console.error('TOOL_INVOKED: recommend_workflow', JSON.stringify(args));
    try {
      const res = recommendWorkflow(loader, args as any);
      console.error('TOOL_COMPLETE: recommend_workflow');
      return { content: [{ type: 'text', text: safeStringify(res) }] };
    } catch (e) {
      console.error('TOOL_ERROR: recommend_workflow', e);
      // Return structured error as JSON text so clients can parse and handle gracefully
      return { content: [{ type: 'text', text: safeStringify({ valid: false, error: String(e) }) }] };
    }
  }
);

//
// =========================
// PROMPTS (CORRECT API)
// =========================

server.registerPrompt(
  "guided_recommendation_form",
  {
    description: "Guided input prompt that helps users produce a complete recommendation context (short or detailed).",
    argsSchema: {
      mode: z.enum(['short', 'detailed']).default('short'),
      partial_context: z.string().optional(),
    },
  },
  async ({ mode, partial_context }) => {
    const modeHint = mode === 'detailed' ? 'Please ask for detailed inputs (traffic, SLAs, integrations, budget, timeline).' : 'Ask for the smallest set of high-impact fields (summary, primaryGoals, scale, data.sensitivity, auth.type).';
    return {
      description: 'Guided recommendation input form',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `You are a form assistant. ${modeHint}\n\nIf the provided partial_context is complete, output a single JSON object matching the recommendation schema. If incomplete, return a single focused question to collect the highest-priority missing field. Output either the JSON object or a single-line question only.\n\nPartial context: ${partial_context ?? '<none>'}`,
          },
        },
      ],
    };
  }
);
//

server.registerPrompt(
  "recommended_pattern",
  {
    description: "Suggest architecture patterns based on context",
    argsSchema: {
      context: z.string().describe("Project context"),
    },
  },
  async ({ context }) => {
    return {
      description: "Recommended architecture patterns",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Analyze this context and recommend architecture patterns:\n\n${context}`,
          },
        },
      ],
    };
  }
);

server.registerPrompt(
  "search_standards",
  {
    description: "Search architecture standards",
    argsSchema: {
      query: z.string(),
    },
  },
  async ({ query }) => {
    return {
      description: "Search architecture standards",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Search standards for: ${query}`,
          },
        },
      ],
    };
  }
);

server.registerPrompt(
  "checklist",
  {
    description: "Get checklist for a standard",
    argsSchema: {
      standard: z.string(),
    },
  },
  async ({ standard }) => {
    return {
      description: "Checklist for standard",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Generate checklist for: ${standard}`,
          },
        },
      ],
    };
  }
);

// Natural-language prompt wrapper: produce JSON args for the `recommend_pattern_nl` tool
server.registerPrompt(
  "recommend_pattern_nl",
  {
    description: "Convert natural language request into tool args for recommendation",
    argsSchema: {
      text: z.string().describe("Natural language request describing the system and constraints"),
    },
  },
  async ({ text }) => {
    return {
      description: "Generate arguments for recommend_pattern_nl tool",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `User request:\n${text}\n\nReturn a single JSON object matching the recommend_pattern_nl tool schema, for example: {"text": "..."}. Output only the JSON object and nothing else.`,
          },
        },
      ],
    };
  }
);

// Natural-language search prompt that helps convert free-text queries into the tool args
server.registerPrompt(
  "search_standards_nl",
  {
    description: "Convert natural language search into standardized query args",
    argsSchema: {
      text: z.string().describe("Natural language search string"),
    },
  },
  async ({ text }) => {
    return {
      description: "Generate arguments for search_standards tool",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Search the cookbook for standards relevant to this request:\n${text}\n\nReturn a single JSON object with a 'query' field, for example: {"query": "authentication"}. Output only the JSON object.`,
          },
        },
      ],
    };
  }
);

//
// =========================
// START SERVER
// =========================
//

async function main() {
  const transport = new StdioServerTransport();

  console.error('Starting MCP server "ai-architecture-cookbook"...');

  await server.connect(transport);

  // Wrap the transport onmessage handler to log raw incoming messages for debugging.
  // We capture the existing handler (set by server.connect) and forward to it after logging.
  try {
    const anyTransport: any = transport as any;
    const originalOnMessage = anyTransport.onmessage;
    anyTransport.onmessage = (msg: unknown) => {
      try {
        console.error('RAW_INCOMING_MESSAGE:', JSON.stringify(msg));
      } catch (e) {
        console.error('RAW_INCOMING_MESSAGE: <unserializable>');
      }
      if (typeof originalOnMessage === 'function') {
        try {
          originalOnMessage(msg);
        } catch (e) {
          console.error('Error forwarding message to original handler', e);
        }
      }
    };
  } catch (e) {
    console.error('Failed to wrap transport.onmessage for debugging', e);
  }

  console.error("MCP server running");
}

main().catch((err) => {
  console.error("Fatal server error:", err);
  process.exit(1);
});