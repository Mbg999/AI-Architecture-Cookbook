import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

export default {
  'http wrapper returns recommendations and exposes metrics': async () => {
    const env = { ...process.env, PORT: '0' };
    const proc = spawn('node', ['examples/http-wrapper.mjs'], { stdio: ['ignore', 'pipe', 'pipe'], env });
    proc.stderr.on('data', (b) => process.stderr.write(`[http-wrapper stderr] ${String(b)}`));
    proc.stdout.on('data', (b) => process.stdout.write(`[http-wrapper stdout] ${String(b)}`));

    // wait for readiness and get the actual port
    const port: number = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('HTTP wrapper start timeout')), 10000);
        const onData = (b: unknown) => {
          const s = String(b || '');
          const m = s.match(/HTTP wrapper listening on http:\/\/localhost:(\d+)/);
          if (m) {
            clearTimeout(timeout);
            proc.stdout.off('data', onData);
            proc.stderr.off('data', onData);
            resolve(Number(m[1]));
          }
        };
        proc.stdout.on('data', onData);
        proc.stderr.on('data', onData);
        proc.on('exit', (code) => reject(new Error('HTTP wrapper exited early: ' + code)));
    });

    // call recommend endpoint
    const body = { text: 'Recommend architecture for a real-time chat app with mobile clients and GDPR.' };
    const resp = await fetch(`http://localhost:${port}/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    assert.equal(resp.status, 200, 'expected 200 from /recommend');
    const json = await resp.json();
    assert.ok(json.recommendations && Array.isArray(json.recommendations), 'expected recommendations array');
    assert.ok(json.recommendations.length > 0, 'expected at least one recommendation');

    // call metrics endpoint
    const m = await fetch(`http://localhost:${port}/metrics`);
    assert.equal(m.status, 200, 'expected 200 from /metrics');
    const metricsText = await m.text();
    assert.ok(metricsText.includes('http_requests_total'), 'metrics should include http_requests_total');

    proc.kill();
  },
};
