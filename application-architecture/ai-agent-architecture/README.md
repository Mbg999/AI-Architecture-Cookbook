# AI Agent Architecture

Patterns for building AI agents — covering agent loops, tool use (function calling / MCP), memory management, planning strategies, human-in-the-loop, and multi-agent orchestration.

## Decision Tree

```
Priority 1: IF agent_complexity == advanced
              THEN → multi_agent_orchestration
              ELSE → simple_reactive_agent

Priority 2: IF planning_strategy in [multi_step, hierarchical]
              THEN → planning_agent (task decomposition)

Priority 3: IF human_in_loop == true
              THEN → human_in_the_loop (approval gates)

Priority 4: IF tool_count in [moderate, many]
              THEN → tool_using_agent (ReAct pattern)

FALLBACK → simple_reactive_agent
```

## Key Patterns

| Pattern | Use Case |
|---------|----------|
| **Simple Reactive Agent** | Single-turn function calling, no planning, no memory |
| **Tool-Using Agent (ReAct)** | Multi-step reasoning with iterative tool selection |
| **Planning Agent** | Task decomposition with dependency resolution and verification |
| **Human-in-the-Loop** | Approval gates before high-impact tool execution |
| **Multi-Agent Orchestration** | Supervisor/worker or swarm for complex cross-domain tasks |

## Context Inputs

- `agent_complexity`: simple / intermediate / advanced
- `tool_count`: few / moderate / many
- `memory_requirement`: stateless / conversational / persistent
- `planning_strategy`: reactive / single_step / multi_step / hierarchical
- `human_in_loop`: boolean
- `max_iterations`: integer (default 10)

## Related Standards

- [llm-integration](../llm-integration/) — Agents rely on LLMs for reasoning and tool selection
- [state-management](../state-management/) — Agent memory and conversation state
- [messaging-events](../../foundational/messaging-events/) — Multi-agent async communication
- [api-design](../../foundational/api-design/) — Agent tools are API wrappers

## Anti-Patterns

- Infinite Agent Loop
- Agent as God Object
- No Human Override
- Revealing System Prompt in Tool Output
- Too Many Tools Per Agent
