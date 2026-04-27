#!/usr/bin/env node
import http from 'node:http';
import { CookbookLoader } from '../dist/loader.js';
import { recommendPatternNl } from '../dist/tools/recommend-pattern-nl.js';

const loader = new CookbookLoader();
const PORT = process.env.PORT ? Number(process.env.PORT) : 0;

let httpRequestsTotal = 0;
const server = http.createServer(async (req, res) => {
  httpRequestsTotal += 1;
  if (req.method === 'POST' && req.url === '/recommend') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        if (!parsed.text || typeof parsed.text !== 'string') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: "Missing 'text' field in JSON body" }));
          return;
        }

        const out = recommendPatternNl(loader, { text: parsed.text });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(out));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: String(err) }));
      }
    });
    return;
  }

  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'POST /recommend {"text":"..."}' }));
    return;
  }

  if (req.method === 'GET' && req.url === '/metrics') {
    res.writeHead(200, { 'Content-Type': 'text/plain; version=0.0.4' });
    res.end(`# HELP http_requests_total Total HTTP requests handled\n# TYPE http_requests_total counter\nhttp_requests_total ${httpRequestsTotal}\n`);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'not found' }));
});

server.listen(PORT, () => {
  const actual = server.address() && server.address().port ? server.address().port : PORT;
  console.error(`HTTP wrapper listening on http://localhost:${actual}`);
});

process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});
