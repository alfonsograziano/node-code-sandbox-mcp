import path from 'path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function main() {
  // 1️⃣ Create the MCP client
  const client = new Client({
    name: 'ephemeral-with-deps-example',
    version: '1.0.0',
  });

  // Host path where you want outputs to land
  const FILES_DIR = '/Users/alfonsograziano/Desktop';

  // Resolve it against $HOME (in case you ever switch to a relative subfolder)
  const hostOutput = path.resolve(process.env.HOME, FILES_DIR);

  // Where we’ll mount that folder _inside_ the MCP‐server container
  const containerOutput = '/root';

  // 2️⃣ Connect to your js-sandbox-mcp server

  await client.connect(
    new StdioClientTransport({
      command: 'npm',
      args: ['run', 'dev'],
      cwd: path.resolve('..'),
      env: { ...process.env, FILES_DIR },
    })
  );

  // await client.connect(
  //   new StdioClientTransport({
  //     command: "docker",
  //     args: [
  //       // 1) Start a new container
  //       "run",
  //       // 2) Keep STDIN open and allocate a pseudo-TTY (required for MCP over stdio)
  //       "-i",
  //       // 3) Remove the container automatically when it exits
  //       "--rm",

  //       // 4) Give the MCP-server access to the Docker socket
  //       //    so it can spin up inner “ephemeral” containers
  //       "-v",
  //       "/var/run/docker.sock:/var/run/docker.sock",

  //       // 5) Bind-mount your Desktop folder into the container at /root
  //       "-v",
  //       `${hostOutput}:${containerOutput}`,

  //       // 6) Pass your host’s output-dir env var _into_ the MCP-server
  //       "-e",
  //       `FILES_DIR=${hostOutput}`,

  //       // 7) The MCP-server image that will manage your ephemeral sandboxes
  //       "alfonsograziano/node-code-sandbox-mcp",
  //     ],
  //     env: {
  //       // inherit your shell’s env
  //       ...process.env,
  //       // also set FILES_DIR inside the MCP-server process
  //       FILES_DIR,
  //     },
  //   })
  // );

  console.log('✅ Connected to js-sandbox-mcp');

  // 3️⃣ Use the run_js_ephemeral tool with a dependency (lodash)
  const result = await client.callTool({
    name: 'run_js_ephemeral',
    arguments: {
      image: 'node:lts-slim',
      code: `
          import fs from 'fs/promises';  
          await fs.writeFile('hello_world.txt', 'Hello world!');
      `,
      dependencies: [
        {
          name: 'lodash',
          version: '^4.17.21',
        },
      ],
    },
  });

  console.log('▶️ run_js_ephemeral output:\n', JSON.stringify(result, null, 2));

  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Error in ephemeral-with-deps example:', err);
  process.exit(1);
});
