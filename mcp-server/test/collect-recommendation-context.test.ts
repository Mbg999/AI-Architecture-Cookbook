import assert from 'node:assert/strict';
import { validateRecommendationContext } from '../src/tools/collect-recommendation-context.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { Client as McpClient } from '@modelcontextprotocol/sdk/client/index.js';

export default {
  'validateRecommendationContext returns valid for complete context': async () => {
    const full = {
      projectName: 'Test Project',
      summary: 'This is a sample project that needs scalability and security.',
      primaryGoals: ['scalability', 'security'],
      scale: 'enterprise',
      traffic: { peakRPS: 200 },
      data: { sensitivity: 'internal', sizeGB: 10, realTime: false },
      auth: { type: 'oauth' },
      integrations: ['db'],
      deployment: 'k8s',
      availability: '99.9%',
      budgetPerMonth: '$5000',
      timelineWeeks: 12,
      teamExpertise: ['nodejs', 'devops'],
    } as const;

    const res = validateRecommendationContext(full as unknown);
    assert.equal(res.valid, true, 'Expected valid === true for full context');
    assert.ok(res.normalizedContext && (res.normalizedContext as any).summary === full.summary);
  },

  'validateRecommendationContext reports missing summary and primaryGoals for empty input': async () => {
    const res = validateRecommendationContext({});
    assert.equal(res.valid, false);
    assert.ok(Array.isArray(res.missingFields) && res.missingFields.length >= 1);
    assert.ok(res.missingFields.includes('summary') || res.missingFields.includes('primaryGoals'));
  },

  'validateRecommendationContext applies sensible defaults': async () => {
    const minimal = { summary: 'This project will scale to many users.', primaryGoals: ['scalability'] };
    const res = validateRecommendationContext(minimal as unknown);
    assert.equal(res.valid, true);
    assert.equal((res.normalizedContext as any).scale, 'enterprise');
    assert.equal(((res.normalizedContext as any).data as any).sensitivity, 'internal');
    assert.equal(((res.normalizedContext as any).auth as any).type, 'oauth');
  },

  'validate_recommendation_context tool available over MCP and returns JSON': async () => {
    const transport = new StdioClientTransport({ command: 'node', args: ['dist/server.js'], cwd: process.cwd(), stderr: 'pipe' });
    const stderrStream = transport.stderr;
    const client = new McpClient({ name: 'test-collect-context', version: '1.0.0' });
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

      const resp = await client.callTool({ name: 'validate_recommendation_context', arguments: { summary: 'Short project summary', primaryGoals: ['scalability'] } });
      const raw = (resp as any)?.content?.[0]?.text ?? JSON.stringify(resp);
      const parsed = JSON.parse(raw as string);
      assert.equal(typeof parsed.valid, 'boolean');
      assert.ok(parsed.normalizedContext);
    } finally {
      try { await client.close(); } catch (e) { /* ignore */ }
      try { await transport.close(); } catch (e) { /* ignore */ }
    }
  },
};
