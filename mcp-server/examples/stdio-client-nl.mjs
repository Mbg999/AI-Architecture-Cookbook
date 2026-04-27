#!/usr/bin/env node
import { spawn } from 'child_process';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { Client as McpClient } from '@modelcontextprotocol/sdk/client/index.js';

async function main() {
  // Create a transport that will spawn the server; request stderr piping so we can observe readiness
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['dist/server.js'],
    cwd: process.cwd(),
    stderr: 'pipe',
  });

  // Attach to the transport's stderr PassThrough (available immediately) so we catch early logs
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
      // No stderr stream available — fallback to a short delay
      setTimeout(resolve, 1000);
    }
  });

  const client = new McpClient({ name: 'cookbook-smoke-client-nl', version: '1.0.0' });
  await client.connect(transport);
  // Wait for server readiness message before calling tools
  await readyPromise;
  // ensure tools metadata is available
  const list = await client.listTools({});
  console.error('listTools returned count=', Array.isArray(list.tools) ? list.tools.length : 'NA');

  // call a tool (search_standards) just to sanity-check index access
  const resp = await client.callTool({ name: 'search_standards', arguments: { query: 'authentication' } });
  console.log('search_standards response:', resp);

  // call recommend_pattern_nl with free-text description
  const rec = await client.callTool({ name: 'recommend_pattern_nl', arguments: {
    text: 'We operate a web application with user login, high security requirements, and sensitive personal data.'
  } });
  console.log('recommend_pattern_nl:', JSON.stringify(rec, null, 2));

  // close transport / server
  try {
    await client.close();
  } catch (e) {
    // ignore
  }
}

main().catch(e => { console.error(e); process.exit(1); });
