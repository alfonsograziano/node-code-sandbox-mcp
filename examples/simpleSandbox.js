import path from 'path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function main() {
  // 1️⃣ Create the MCP client
  const client = new Client({
    name: 'example-client',
    version: '1.0.0',
  });

  // 2️⃣ Launch & connect to the js-sandbox-mcp server
  await client.connect(
    new StdioClientTransport({
      command: 'npm',
      args: ['run', 'dev'], // runs `npm run dev` in the sandbox folder
      cwd: path.resolve('..'),
    })
  );

  console.log('✅ Connected to js-sandbox-mcp');

  // 3️⃣ List available tools
  const tools = await client.listTools();
  console.log('🔧 Available tools:');
  console.dir(tools, { depth: null });

  // 4️⃣ Initialize a fresh sandbox container
  const initResult = await client.callTool({
    name: 'sandbox_initialize',
    arguments: {
      /* no args = uses default node:lts-slim */
    },
  });
  const containerId = initResult.content[0].text;
  console.log(`🐳 Container started: ${containerId}`);

  // 5️⃣ Run a JS snippet inside the container
  const runResult = await client.callTool({
    name: 'run_js',
    arguments: {
      container_id: containerId,
      code: `
        import { randomUUID } from 'node:crypto';
        console.log('Hello from sandbox! Your UUID is', randomUUID());
      `,
      dependencies: [],
    },
  });
  console.log('▶️ run_js output:\n', runResult.content[0].text);

  // 6️⃣ Tear down the container
  const stopResult = await client.callTool({
    name: 'sandbox_stop',
    arguments: { container_id: containerId },
  });
  console.log('🛑', stopResult.content[0].text);

  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Error in example:', err);
  process.exit(1);
});
