// mcp-server/examples/test-nl.mjs
import { spawn } from 'child_process';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { Client as McpClient } from '@modelcontextprotocol/sdk/client/index.js';

async function main() {
  const proc = spawn('node', ['dist/server.js'], { stdio: ['pipe', 'pipe', 'inherit'] });
  const transport = new StdioClientTransport(proc.stdin, proc.stdout);

  const client = new McpClient({ name: 'cookbook-nl-client' });
  await client.connect(transport);

  const resp = await client.callTool('recommend_pattern_nl', {
    text: 'Recommend the top 3 architecture patterns for an enterprise web+mobile application that requires user login and has real-time features.'
  });

  console.log('recommend_pattern_nl response:', resp);
  proc.kill();
}

main().catch(e => { console.error(e); process.exit(1); });
