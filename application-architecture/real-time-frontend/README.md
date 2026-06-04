# Real-Time Frontend

Patterns for real-time client-side communication — WebSockets, SSE, polling strategies, resilient reconnection, and state sync.

## Decision Tree

```
Priority 1: IF update_freshness == realtime AND connection_reliability in [stable, flaky] → websocket_client
Priority 2: IF connection_reliability == unreliable    → resilient_reconnection
Priority 3: IF update_freshness == near_realtime        → server_sent_events
Priority 4: IF update_freshness == periodic              → polling_strategy
FALLBACK → polling_strategy
```

## Key Patterns

| Pattern | Use Case |
|---------|----------|
| **WebSocket Client** | Sub-100ms bidirectional updates |
| **Resilient Reconnection** | Flaky networks, message buffering |
| **Server-Sent Events** | One-way server→client near-real-time |
| **Polling** | Simple periodic checks |

## Context Inputs

- `update_freshness`: realtime / near_realtime / periodic
- `connection_reliability`: stable / flaky / unreliable
- `payload_size`: small / medium / large

## Related Standards

- [messaging-events](../messaging-events/) — Server-side event streams
- [frontend-state-management](../frontend-state-management/) — State sync with UI

## Anti-Patterns

- No Connection Status Indicator
- Polling Too Aggressively
- No Message Buffering on Disconnect
