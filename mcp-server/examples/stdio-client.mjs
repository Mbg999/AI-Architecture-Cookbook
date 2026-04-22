// mcp-server/examples/stdio-client.mjs
import { spawn } from 'child_process';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { McpClient } from '@modelcontextprotocol/sdk/client/mcp.js';

async function main() {
  // spawn server process
  const proc = spawn('node', ['dist/server.js'], { stdio: ['pipe', 'pipe', 'inherit'] });

  // wire transport to server stdio
  const transport = new StdioClientTransport(proc.stdin, proc.stdout);

  const client = new McpClient({ name: 'cookbook-smoke-client' });
  await client.connect(transport);

  // call a tool (search_standards)
  const resp = await client.callTool('search_standards', { query: 'authentication' });
  console.log('search_standards response:', resp);

  // call recommend_pattern example
  const rec = await client.callTool('recommend_pattern', {
    domains: ['authentication'],
    context: { client_types: 'web', needs_login: true }
  });
  console.log('recommend_pattern:', rec);

  proc.kill();
}
main().catch(e => { console.error(e); process.exit(1); });