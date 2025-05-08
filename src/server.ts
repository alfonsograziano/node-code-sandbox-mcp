#!/usr/bin/env node

import {
  McpServer,
  ResourceTemplate,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { randomUUID } from 'crypto';
import initializeSandbox, {
  argSchema as initializeSchema,
  setServerRunId,
} from './tools/initialize.ts';
import execInSandbox, { argSchema as execSchema } from './tools/exec.ts';
import runJs, { argSchema as runJsSchema } from './tools/runJs.ts';
import stopSandbox, { argSchema as stopSchema } from './tools/stop.ts';
import runJsEphemeral, {
  argSchema as ephemeralSchema,
} from './tools/runJsEphemeral.ts';
import mime from 'mime-types';
import fs from 'fs/promises';
import { z } from 'zod';
import { getConfig } from './config.ts';
import { startScavenger, cleanActiveContainers } from './containerUtils.ts';
import { setServerInstance, logger } from './logger.ts';
import getDependencyTypes, {
  argSchema as getDependencyTypesSchema,
} from './tools/getDependencyTypes.ts';

export const serverRunId = randomUUID();
setServerRunId(serverRunId);

// Create the server with logging capability enabled
const server = new McpServer(
  {
    name: 'js-sandbox-mcp',
    version: '0.1.0',
    description:
      'Run arbitrary JavaScript inside disposable Docker containers and install npm dependencies on the fly.',
  },
  {
    capabilities: {
      logging: {},
    },
  }
);

// Set the server instance for logging
setServerInstance(server);

// Configure server tools and resources
server.tool(
  'sandbox_initialize',
  'Start a new isolated Docker container running Node.js. Used to set up a sandbox session for multiple commands and scripts.',
  initializeSchema,
  initializeSandbox
);

server.tool(
  'sandbox_exec',
  'Execute one or more shell commands inside a running sandbox container. Requires a sandbox initialized beforehand.',
  execSchema,
  execInSandbox
);

server.tool(
  'run_js',
  `Install npm dependencies and run JavaScript code inside a running sandbox container.
  After running, you must manually stop the sandbox to free resources.
  The code must be valid ESModules (import/export syntax). Best for complex workflows where you want to reuse the environment across multiple executions.
  When reading and writing from the Node.js processes, you always need to read from and write to the "./files" directory to ensure persistence on the mounted volume.`,
  runJsSchema,
  runJs
);

server.tool(
  'sandbox_stop',
  'Terminate and remove a running sandbox container. Should be called after finishing work in a sandbox initialized with sandbox_initialize.',
  stopSchema,
  stopSandbox
);

server.tool(
  'run_js_ephemeral',
  `Run a JavaScript snippet in a temporary disposable container with optional npm dependencies, then automatically clean up. 
  The code must be valid ESModules (import/export syntax). Ideal for simple one-shot executions without maintaining a sandbox or managing cleanup manually.
  When reading and writing from the Node.js processes, you always need to read from and write to the "./files" directory to ensure persistence on the mounted volume.
  This includes images (e.g., PNG, JPEG) and other files (e.g., text, JSON, binaries).

  Example:
  \`\`\`js
  import fs from "fs/promises";
  await fs.writeFile("./files/hello.txt", "Hello world!");
  console.log("Saved ./files/hello.txt");
  \`\`\`
`,
  ephemeralSchema,
  runJsEphemeral
);

server.tool(
  'get_dependency_types',
  `
  Given an array of npm package names (and optional versions), 
  fetch whether each package ships its own TypeScript definitions 
  or has a corresponding @types/… package, and return the raw .d.ts text.
  
  Useful whenwhen you're about to run a Node.js script against an unfamiliar dependency 
  and want to inspect what APIs and types it exposes.
  `,
  getDependencyTypesSchema,
  getDependencyTypes
);

server.resource(
  'file',
  new ResourceTemplate('file://{+filepath}', { list: undefined }),
  async (uri) => {
    const filepath = new URL(uri).pathname;
    const data = await fs.readFile(filepath);
    const mimeType = mime.lookup(filepath) || 'application/octet-stream';
    return {
      contents: [
        {
          uri: uri.toString(),
          mimeType,
          blob: data.toString('base64'),
        },
      ],
    };
  }
);

server.prompt('run-node-js-script', { prompt: z.string() }, ({ prompt }) => ({
  messages: [
    {
      role: 'user',
      content: {
        type: 'text',
        text:
          `Here is my prompt:\n\n${prompt}\n\n` +
          `Follow modern Node.js best practices:\n` +
          // I've noticed that gpt4o-mini tends to use CommonJS
          `- Use ECMAScript Modules (ESM) syntax (import/export), avoid CommonJS (require/module.exports)\n` +
          // gpt4o-mini tends to try to install node-fetch
          `- Use native fetch, avoid node-fetch or axios unless absolutely necessary or requested\n` +
          `- Prefer top-level await in ES modules when appropriate\n` +
          `- Use async/await consistently for asynchronous code, avoid mixing with .then/.catch\n` +
          `- Avoid callback-style code in favor of Promises and async/await\n` +
          `- Avoid unnecessary dependencies if a native API is available\n` +
          `Please write and run a Node.js script.`,
      },
    },
  ],
}));

const scavengerIntervalHandle = startScavenger(
  getConfig().containerTimeoutMilliseconds,
  getConfig().containerTimeoutSeconds
);

async function gracefulShutdown(signal: string) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  clearInterval(scavengerIntervalHandle);
  logger.info('Stopped container scavenger.');

  await cleanActiveContainers();

  setTimeout(() => {
    logger.info('Exiting.');
    process.exit(0);
  }, 500);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2'));

// Set up the transport
const transport = new StdioServerTransport();

// Connect the server to start receiving and sending messages
logger.info('Initializing server...');
await server.connect(transport);
logger.info('Server started and connected successfully');
logger.info(
  `Container timeout set to: ${getConfig().containerTimeoutSeconds} seconds (${getConfig().containerTimeoutMilliseconds}ms)`
);
