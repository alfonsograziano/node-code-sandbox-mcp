# 🐢🚀 Node.js Sandbox MCP Server

Node.js server implementing the Model Context Protocol (MCP) for running arbitrary JavaScript in ephemeral Docker containers with on‑the‑fly npm dependency installation.

![Website Preview](https://raw.githubusercontent.com/alfonsograziano/node-code-sandbox-mcp/master/assets/images/website_homepage.png)

👉 [Look at the official website](https://jsdevai.com/)

## Features

- Start and manage isolated Node.js sandbox containers
- Execute arbitrary shell commands inside containers
- Install specified npm dependencies per job
- Run ES module JavaScript snippets and capture stdout
- Tear down containers cleanly
- **Detached Mode:** Keep the container alive after script execution (e.g. for long-running servers)

> Note: Containers run with controlled CPU/memory limits.

## Explore Cool Use Cases

If you want ideas for cool and powerful ways to use this library, check out the [use cases section on the website](https://jsdevai.com/#use-cases)
It contains a curated list of prompts, examples, and creative experiments you can try with the Node.js Sandbox MCP Server.

## ⚠️ Prerequisites

To use this MCP server, Docker must be installed and running on your machine.

**Tip:** Pre-pull any Docker images you'll need to avoid delays during first execution.

Example recommended images:

- node:lts-slim
- mcr.microsoft.com/playwright:v1.52.0-noble
- alfonsograziano/node-chartjs-canvas:latest

## Getting started

In order to get started with this MCP server, first of all you need to connect it to a client (for example Claude Desktop).

Once it's running, you can test that it's fully working with a couple of test prompts:

- Validate that the tool can run:

  ```markdown
  Create and run a JS script with a console.log("Hello World")
  ```

  This should run a console.log and in the tool response you should be able to see Hello World.

- Validate that you can install dependencies and save files
  ```markdown
  Create and run a JS script that generates a QR code for the URL `https://nodejs.org/en`, and save it as `qrcode.png` **Tip:** Use the `qrcode` package.
  ```
  This should create a file in your mounted directory (for example the Desktop) called "qrcode.png"

### Usage with Claude Desktop

Add this to your `claude_desktop_config.json`:
You can follow the [Official Guide](https://modelcontextprotocol.io/quickstart/user) to install this MCP server

```json
{
  "mcpServers": {
    "js-sandbox": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-v",
        "/var/run/docker.sock:/var/run/docker.sock",
        "-v",
        "$HOME/Desktop/sandbox-output:/root",
        "-e",
        "FILES_DIR=$HOME/Desktop/sandbox-output",
        "-e",
        "SANDBOX_MEMORY_LIMIT=512m", // optional
        "-e",
        "SANDBOX_CPU_LIMIT=0.75", // optional
        "alfonsograziano/node-code-sandbox-mcp"
      ]
    }
  }
}
```

or with NPX:

```json
{
  "mcpServers": {
    "node-code-sandbox-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "node-code-sandbox-mcp"],
      "env": {
        "FILES_DIR": "/Users/alfonsograziano/Desktop/node-sandbox",
        "SANDBOX_MEMORY_LIMIT": "512m", // optional
        "SANDBOX_CPU_LIMIT": "0.75" // optional
      }
    }
  }
}
```

> Note: Ensure your working directory points to the built server, and Docker is installed/running.

### Docker

Run the server in a container (mount Docker socket if needed), and pass through your desired host output directory as an env var:

```shell
# Build locally if necessary
# docker build -t alfonsograziano/node-code-sandbox-mcp .

docker run --rm -it \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v "$HOME/Desktop/sandbox-output":"/root" \
  -e FILES_DIR="$HOME/Desktop/sandbox-output" \
  -e SANDBOX_MEMORY_LIMIT="512m" \
  -e SANDBOX_CPU_LIMIT="0.5" \
  alfonsograziano/node-code-sandbox-mcp stdio
```

This bind-mounts your host folder into the container at the **same absolute path** and makes `FILES_DIR` available inside the MCP server.

### Usage with VS Code

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
                "-v", "$HOME/Desktop/sandbox-output:/root",
                "-e", "FILES_DIR=$HOME/Desktop/sandbox-output",
                "-e", "SANDBOX_MEMORY_LIMIT=512m",
                "-e", "SANDBOX_CPU_LIMIT=1",
                "alfonsograziano/node-code-sandbox-mcp"
              ]
        }
    }
}
```

## API

## Tools

### run_js_ephemeral

Run a one-off JS script in a brand-new disposable container.

**Inputs:**

- `image` (string, optional): Docker image to use (default: `node:lts-slim`).
- `code` (string, required): JavaScript source to execute.
- `dependencies` (array of `{ name, version }`, optional): NPM packages and versions to install (default: `[]`).

**Behavior:**

1. Creates a fresh container.
2. Writes your `index.js` and a minimal `package.json`.
3. Installs the specified dependencies.
4. Executes the script.
5. Tears down (removes) the container.
6. Returns the captured stdout.
7. If your code saves any files in the current directory, these files will be returned automatically.
   - Images (e.g., PNG, JPEG) are returned as `image` content.
   - Other files (e.g., `.txt`, `.json`) are returned as `resource` content.
   - Note: the file saving feature is currently available only in the ephemeral tool.

> **Tip:** To get files back, simply save them during your script execution.

**Example Call:**

```jsonc
{
  "name": "run_js_ephemeral",
  "arguments": {
    "image": "node:lts-slim",
    "code": "console.log('One-shot run!');",
    "dependencies": [{ "name": "lodash", "version": "^4.17.21" }],
  },
}
```

**Example to save a file:**

```javascript
import fs from 'fs/promises';

await fs.writeFile('hello.txt', 'Hello world!');
console.log('Saved hello.txt');
```

This will return the console output **and** the `hello.txt` file.

### sandbox_initialize

Start a fresh sandbox container.

- **Input**:
  - `image` (_string_, optional, default: `node:lts-slim`): Docker image for the sandbox
  - `port` (_number_, optional): If set, maps this container port to the host
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
  - `listenOnPort` (_number_, optional): If set, leaves the process running and exposes this port to the host (**Detached Mode**)

- **Behavior:**

  1. Creates a temp workspace inside the container
  2. Writes `index.js` and a minimal `package.json`
  3. Runs `npm install --omit=dev --ignore-scripts --no-audit --loglevel=error`
  4. Executes `node index.js` and captures stdout, or leaves process running in background if `listenOnPort` is set
  5. Cleans up workspace unless running in detached mode

- **Output**: Script stdout or background execution notice

### sandbox_stop

Terminate and remove the sandbox container.

- **Input**:
  - `container_id` (_string_): ID from `sandbox_initialize`
- **Output**: Confirmation message

## Usage Tips

- **Session-based tools** (`sandbox_initialize` ➔ `run_js` ➔ `sandbox_stop`) are ideal when you want to:
  - Keep a long-lived sandbox container open.
  - Run multiple commands or scripts in the same environment.
  - Incrementally install and reuse dependencies.
- **One-shot execution** with `run_js_ephemeral` is perfect for:
  - Quick experiments or simple scripts.
  - Cases where you don’t need to maintain state or cache dependencies.
  - Clean, atomic runs without worrying about manual teardown.
- **Detached mode** is useful when you want to:
  - Spin up servers or long-lived services on-the-fly
  - Expose and test endpoints from running containers

Choose the workflow that best fits your use-case!

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
