import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { Client as McpClient } from '@modelcontextprotocol/sdk/client/index.js';

export default {
  'stdio transport attach spawns server and calls tool': async () => {
    // Use StdioClientTransport to spawn the server process (preferred/reliable API)
    const transport = new StdioClientTransport({
      command: 'node',
      args: ['dist/server.js'],
      cwd: process.cwd(),
      stderr: 'pipe',
    });

    // expose transport stderr (PassThrough) for early logs
    const stderrStream = transport.stderr;

    // Wait for the transport to spawn the child process and the server to be ready
    const client = new McpClient({ name: 'cookbook-stdio-smoke', version: '1.0.0' });
    try {
      await client.connect(transport);

      // wait for the server to print readiness if we have a stderr stream
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

      // call listTools first to ensure the server's tool registry is reachable
      const list = await client.listTools({});
      console.error('listTools returned count=', Array.isArray(list.tools) ? list.tools.length : 'NA');
      const searchTool = Array.isArray(list.tools) ? list.tools.find((t) => t.name === 'search_standards') : null;
      console.error('search_standards meta:', JSON.stringify(searchTool, null, 2));

      // call a simple tool to sanity-check the protocol
      const resp = await client.callTool({ name: 'search_standards', arguments: { query: 'authentication' } });
      assert.ok(resp && resp.content, 'expected tool response content');
    } catch (err) {
      console.error('Stdio smoke test error:', err instanceof Error ? err.stack || err.message : String(err));
      throw err;
    } finally {
      try {
        await client.close();
      } catch (e) {
        // ignore
      }
      try {
        await transport.close();
      } catch (e) {
        // ignore
      }
    }
  },
};
