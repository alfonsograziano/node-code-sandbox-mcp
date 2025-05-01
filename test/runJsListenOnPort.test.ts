import { describe, it, expect } from "vitest";
import runJs from "../src/tools/runJs";
import initializeSandbox from "../src/tools/initialize";
import stopSandbox from "../src/tools/stop";

describe("runJs with listenOnPort using Node.js http module", () => {
  it("should start a basic HTTP server in the container and expose it on the given port", async () => {
    const port = 3003;
    const start = await initializeSandbox({ port });
    const content = start.content[0];
    if (content.type !== "text") throw new Error("Unexpected content type");
    const containerId = content.text;

    try {
      // RunJS returns a promise that resolves when the server is started and listening
      // on the specified port. The server will run in the background.
      const result = await runJs({
        container_id: containerId,
        code: `
          import http from 'http';

          const server = http.createServer((req, res) => {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('ok');
          });

          server.listen(${port}, '0.0.0.0', () => {
            console.log('Server started');
          });
        `,
        dependencies: [],
        listenOnPort: port,
      });

      expect(result).toBeDefined();
      expect(result.content[0].type).toBe("text");

      if (result.content[0].type === "text") {
        expect(result.content[0].text).toContain(
          "Server started in background"
        );
      }

      const res = await fetch(`http://localhost:${port}`);
      const body = await res.text();
      expect(body).toBe("ok");
    } finally {
      await stopSandbox({ container_id: containerId });
    }
  }, 10_000);
});
