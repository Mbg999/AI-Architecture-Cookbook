#!/usr/bin/env node
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { Client as McpClient } from '@modelcontextprotocol/sdk/client/index.js';
import readline from 'node:readline/promises';
import process from 'process';

async function main() {
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['dist/server.js'],
    cwd: process.cwd(),
    stderr: 'pipe',
  });

  const stderrStream = transport.stderr;
  const readyPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Server start timeout')), 15000);
    if (stderrStream) {
      const onData = (b) => {
        const s = String(b || '');
        process.stderr.write(s);
        if (s.includes('MCP server running')) {
          clearTimeout(timeout);
          stderrStream.off('data', onData);
          resolve();
        }
      };
      stderrStream.on('data', onData);
    } else {
      setTimeout(resolve, 1000);
    }
  });

  const client = new McpClient({ name: 'collect-context-client', version: '1.0.0' });
  await client.connect(transport);
  await readyPromise;

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    let context = {};
    while (true) {
      const resp = await client.callTool({ name: 'validate_recommendation_context', arguments: context });
      const raw = resp?.content?.[0]?.text ?? JSON.stringify(resp);
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        console.error('Invalid response from validate_recommendation_context:', raw);
        break;
      }

      if (parsed.valid) {
        console.log('Context complete. Normalized context:');
        console.log(JSON.stringify(parsed.normalizedContext, null, 2));
        console.log('\nRequesting recommendations...');
        const rec = await client.callTool({ name: 'recommend_pattern', arguments: { context: parsed.normalizedContext } });
        console.log('recommend_pattern result:');
        console.log(rec);
        break;
      } else {
        console.log('\nMissing fields:', parsed.missingFields);
        console.log(parsed.nextQuestion);
        const answer = await rl.question('> ');
        const mf = (parsed.missingFields && parsed.missingFields[0]) || null;
        if (!mf) {
          console.error('No missing field suggested; exiting.');
          break;
        }
        if (mf === 'primaryGoals' || mf.includes('primaryGoals')) {
          context.primaryGoals = answer.split(',').map((s) => s.trim()).filter(Boolean);
        } else if (mf === 'summary') {
          context.summary = answer.trim();
        } else if (mf === 'projectName') {
          context.projectName = answer.trim();
        } else if (mf === 'scale') {
          context.scale = answer.trim();
        } else if (mf.toLowerCase().includes('rps') || mf.toLowerCase().includes('peak')) {
          const num = parseFloat(answer);
          if (!isNaN(num)) {
            context.traffic = context.traffic || {};
            context.traffic.peakRPS = num;
          } else context[mf] = answer;
        } else {
          // naive assignment for other fields
          try {
            // try JSON parse (for arrays / objects)
            context[mf] = JSON.parse(answer);
          } catch (e) {
            context[mf] = answer;
          }
        }
      }
    }
  } finally {
    rl.close();
    try {
      await client.close();
    } catch (e) {
      // ignore
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
