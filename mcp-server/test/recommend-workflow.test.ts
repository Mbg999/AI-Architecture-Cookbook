import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { CookbookLoader } from '../src/loader.js';
import { recommendWorkflow } from '../src/tools/recommend-workflow.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { Client as McpClient } from '@modelcontextprotocol/sdk/client/index.js';

const REPO_ROOT = resolve(import.meta.dirname, '../..');
const loader = new CookbookLoader(REPO_ROOT);

export default {
  'recommendWorkflow reports missing when context incomplete': async () => {
    const res = recommendWorkflow(loader, { context: {} as any, mode: 'quick' });
    assert.equal(res.valid, false);
    assert.ok(Array.isArray(res.missingFields));
  },

  'recommendWorkflow returns recommendations for complete context': async () => {
    const ctx = { summary: 'This is a sample project that needs scalable, secure infra.', primaryGoals: ['scalability'] };
    const res = recommendWorkflow(loader, { context: ctx, mode: 'quick' });
    assert.equal(res.valid, true);
    assert.ok(Array.isArray((res as any).recommendations));
  },

  'recommend_workflow tool available over MCP and returns JSON': async () => {
    const transport = new StdioClientTransport({ command: 'node', args: ['dist/server.js'], cwd: process.cwd(), stderr: 'pipe' });
    const stderrStream = transport.stderr;
    const client = new McpClient({ name: 'test-recommend-workflow', version: '1.0.0' });
    try {
      await client.connect(transport);
      if (stderrStream) {
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Server start timeout')), 15000);
          const onData = (b: unknown) => {
            const s = String(b || '');
            process.stderr.write(s);
            if (s.includes('MCP server running')) {
              clearTimeout(timeout);
              stderrStream.off('data', onData);
              resolve();
            }
          };
          stderrStream.on('data', onData);
        });
      }

      // Ensure the spawned server actually exposes the recommend_workflow tool
      const list = await client.listTools({});
      console.error('listTools returned count=', Array.isArray(list.tools) ? list.tools.length : 'NA');
      const toolNames = Array.isArray(list.tools) ? list.tools.map((t: any) => t.name) : [];
      if (!toolNames.includes('recommend_workflow')) {
        console.error('Available tools:', toolNames);
        throw new Error('recommend_workflow not found in spawned server tools');
      }

      const resp = await client.callTool({ name: 'recommend_workflow', arguments: { context: { summary: 'This project needs scalability and security.', primaryGoals: ['scalability'] }, mode: 'audit' } });
      const raw = (resp as any)?.content?.[0]?.text ?? JSON.stringify(resp);
      let parsed;
      try {
        parsed = JSON.parse(raw as string);
      } catch (err) {
        console.error('RAW TOOL RESPONSE (recommend_workflow):', raw);
        throw err;
      }
      assert.equal(parsed.valid, true);
      assert.ok(Array.isArray(parsed.recommendations));
    } finally {
      try { await client.close(); } catch (e) { /* ignore */ }
      try { await transport.close(); } catch (e) { /* ignore */ }
    }
  },
};
