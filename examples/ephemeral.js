import path from 'path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function main() {
  // 1️⃣ Create the MCP client
  const client = new Client({
    name: 'ephemeral-example',
    version: '1.0.0',
  });

  // 2️⃣ Connect to your js-sandbox-mcp server
  await client.connect(
    new StdioClientTransport({
      command: 'npm',
      args: ['run', 'dev'],
      cwd: path.resolve('..'),
      env: { ...process.env },
    })
  );

  console.log('✅ Connected to js-sandbox-mcp');

  // 3️⃣ Use the new run_js_ephemeral tool in one step
  const result = await client.callTool({
    name: 'run_js_ephemeral',
    arguments: {
      image: 'node:lts-slim',
      code: `
        import { randomUUID } from 'node:crypto';
        console.log('Ephemeral run! Your UUID is', randomUUID());
      `,
      dependencies: [],
    },
  });

  console.log('▶️ run_js_ephemeral output:\n', result.content[0].text);

  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Error in ephemeral example:', err);
  process.exit(1);
});
