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

server.tool("sandbox_initialize", initializeSchema, initializeSandbox);
server.tool("sandbox_exec", execSchema, execInSandbox);
server.tool("run_js", runJsSchema, runJs);
server.tool("sandbox_stop", stopSchema, stopSandbox);
server.tool("run_js_ephemeral", ephemeralSchema, runJsEphemeral);

const transport = new StdioServerTransport();
await server.connect(transport);
