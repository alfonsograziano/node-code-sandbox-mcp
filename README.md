# JavaScript Sandbox MCP Server

Node.js server implementing the Model Context Protocol (MCP) for running arbitrary JavaScript in ephemeral Docker containers with on‑the‑fly npm dependency installation.

## Features

- Start and manage isolated Node.js sandbox containers
- Execute arbitrary shell commands inside containers
- Install specified npm dependencies per job
- Run ES module JavaScript snippets and capture stdout
- Tear down containers cleanly

> Note: Containers run with controlled CPU/memory limits.

## API

## Tools

### run_js_ephemeral

Run a one-off JS script in a brand-new disposable container.

**Inputs:**

- `image` (string, optional): Docker image to use (default: `node:20-slim`).
- `code` (string, required): JavaScript source to execute.
- `dependencies` (array of `{ name, version }`, optional): NPM packages and versions to install (default: `[]`).

**Behavior:**

1. Creates a fresh container.
2. Writes your `index.js` and a minimal `package.json`.
3. Installs the specified dependencies.
4. Executes the script.
5. Tears down (removes) the container.
6. Returns the captured stdout.

**Example Call:**

```jsonc
{
  "name": "run_js_ephemeral",
  "arguments": {
    "image": "node:20-slim",
    "code": "console.log('One-shot run!');",
    "dependencies": [{ "name": "lodash", "version": "^4.17.21" }]
  }
}
```

### sandbox_initialize

Start a fresh sandbox container.

- **Input**:
  - `image` (_string_, optional, default: `node:20-slim`): Docker image for the sandbox
- **Output**: Container ID string

### sandbox_exec

Run shell commands inside the running sandbox.

- **Input**:
  - `container_id` (_string_): ID from `sandbox_initialize`
  - `commands` (_string[]_): Array of shell commands to execute
- **Output**: Combined stdout of each command

### run_js

Install npm dependencies and execute JavaScript code.

- **Input**:
  - `container_id` (_string_): ID from `sandbox_initialize`
  - `code` (_string_): JS source to run (ES modules supported)
  - `dependencies` (_array of `{ name, version }`_, optional, default: `[]`): npm package names → semver versions
- **Behavior**:
  1. Creates a temp workspace inside the container
  2. Writes `index.js` and a minimal `package.json`
  3. Runs `npm install --omit=dev --ignore-scripts --no-audit --loglevel=error`
  4. Executes `node index.js` and captures stdout
  5. Cleans up workspace
- **Output**: Script stdout

### sandbox_stop

Terminate and remove the sandbox container.

- **Input**:
  - `container_id` (_string_): ID from `sandbox_initialize`
- **Output**: Confirmation message

## Usage with Claude Desktop

Add this to your `claude_desktop_config.json`:

```jsonc
{
  "mcpServers": {
    "js-sandbox": {
      "command": "node",
      "args": ["dist/server.js", "stdio"],
      "cwd": "/path/to/js-sandbox-mcp"
    }
  }
}
```

> Note: Ensure your working directory points to the built server, and Docker is installed/running.

## Usage Tips

- **Session-based tools** (`sandbox_initialize` ➔ `run_js` ➔ `sandbox_stop`) are ideal when you want to:
  - Keep a long-lived sandbox container open.
  - Run multiple commands or scripts in the same environment.
  - Incrementally install and reuse dependencies.
- **One-shot execution** with `run_js_ephemeral` is perfect for:
  - Quick experiments or simple scripts.
  - Cases where you don’t need to maintain state or cache dependencies.
  - Clean, atomic runs without worrying about manual teardown.

Choose the workflow that best fits your use-case!

## Docker

Run the server in a container (mount Docker socket if needed):

```shell
# Build and publish your image locally if needed
# docker build -t alfonsograziano/node-code-sandbox-mcp .

# Run with stdio transport
docker run --rm -it \
  -v /var/run/docker.sock:/var/run/docker.sock \
  alfonsograziano/node-code-sandbox-mcp stdio
```

## Usage with VS Code

**Quick install** buttons (VS Code & Insiders):

Install js-sandbox-mcp (NPX) Install js-sandbox-mcp (Docker)

**Manual configuration**: Add to your VS Code `settings.json` or `.vscode/mcp.json`:

```json
"mcp": {
    "servers": {
        "js-sandbox": {
            "command": "docker",
            "args": [
                "run",
                "-i",
                "--rm",
                "-v", "/var/run/docker.sock:/var/run/docker.sock",
                "alfonsograziano/node-code-sandbox-mcp"
              ],
            "cwd": "${workspaceFolder}/js-sandbox-mcp"
        }
    }
}
```

## Build

Compile and bundle:

```shell
npm install
npm run build
```

## License

MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
