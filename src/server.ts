import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import initializeSandbox, {
  argSchema as initializeSchema,
} from "./tools/initialize.js";
import execInSandbox, { argSchema as execSchema } from "./tools/exec.js";
import runJs, { argSchema as runJsSchema } from "./tools/runJs.js";
import stopSandbox, { argSchema as stopSchema } from "./tools/stop.js";
import runJsEphemeral, {
  argSchema as ephemeralSchema,
} from "./tools/runJsEphemeral.js";

const server = new McpServer({
  name: "js-sandbox-mcp",
  version: "0.1.0",
  description:
    "Run arbitrary JavaScript inside disposable Docker containers and install npm dependencies on the fly.",
});
server.tool(
  "sandbox_initialize",
  "Start a new isolated Docker container running Node.js. Used to set up a sandbox session for multiple commands and scripts.",
  initializeSchema,
  initializeSandbox
);

server.tool(
  "sandbox_exec",
  "Execute one or more shell commands inside a running sandbox container. Requires a sandbox initialized beforehand.",
  execSchema,
  execInSandbox
);

server.tool(
  "run_js",
  "Install npm dependencies and run JavaScript code inside a running sandbox container. After running, you must manually stop the sandbox to free resources. The code must be valid ESModules (import/export syntax). Best for complex workflows where you want to reuse the environment across multiple executions.",
  runJsSchema,
  runJs
);

server.tool(
  "sandbox_stop",
  "Terminate and remove a running sandbox container. Should be called after finishing work in a sandbox initialized with sandbox_initialize.",
  stopSchema,
  stopSandbox
);

server.tool(
  "run_js_ephemeral",
  "Run a JavaScript snippet in a temporary disposable container with optional npm dependencies, then automatically clean up. " +
    "The code must be valid ESModules (import/export syntax). Ideal for simple one-shot executions without maintaining a sandbox or managing cleanup manually. " +
    "If your script saves files in the current directory, these files will be returned automatically as part of the result. " +
    "This includes images (e.g., PNG, JPEG) and other files (e.g., text, JSON, binaries).\n\n" +
    "Example:\n\n" +
    "```js\n" +
    'import fs from "fs/promises";\n\n' +
    'await fs.writeFile("hello.txt", "Hello world!");\n' +
    'console.log("Saved hello.txt");\n' +
    "```\n\n" +
    "In this example, the tool will return the console output **and** the `hello.txt` file as resource.",
  ephemeralSchema,
  runJsEphemeral
);

const transport = new StdioServerTransport();
await server.connect(transport);
