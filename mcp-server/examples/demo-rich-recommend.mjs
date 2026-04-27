import { CookbookLoader } from '../dist/loader.js';
import { recommendPatternNl } from '../dist/tools/recommend-pattern-nl.js';

const loader = new CookbookLoader();

const chatAppPrompt = `Goal: Architect a mobile-first real-time chat app (direct messaging only) similar to Instagram DMs. Requirements: 1:1 and small-group chats; text, images, short videos, attachments; reactions, typing indicators, read/delivery receipts, message edit/delete, message search, offline sync and local cache, push notifications (APNs/FCM), message retention/moderation, GDPR. Non-functional: sub-second realtime latency, durable persistence, per-conversation ordering, horizontal scale (millions MAU), multi-region availability, cost-conscious, optional E2EE. Tech prefs: TypeScript/Node backend, Angular/web + mobile clients, PostgreSQL for message history, Redis for presence/cache/pubsub, S3-compatible object storage for media, Docker/Kubernetes; prefer managed services; avoid storing raw media in DB. Deliver a recommendation covering: (1) MVP vs long-term patterns (WebSocket+Pub/Sub fanout, broker commit log, CQRS/event-sourcing, sharded conversation partitioning, read-model caching), (2) data model outline, (3) real-time delivery semantics, (4) offline sync/local cache strategy, (5) attachments/CDN/signed-URL strategy, (6) push notification gateway design, (7) scaling/sharding strategy, (8) operational suggestions (monitoring/backpressure/rate-limiting/GDPR/moderation), (9) OSS components and managed alternatives. For each pattern give one-line rationale, main trade-offs, and mark MVP vs defer-to-scale.`;

const args = { text: chatAppPrompt };

const res = recommendPatternNl(loader, args);
console.log(JSON.stringify(res, null, 2));
