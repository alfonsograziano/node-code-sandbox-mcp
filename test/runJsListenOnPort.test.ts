import { describe, it, expect } from "vitest";
import runJs from "../src/tools/runJs";
import initializeSandbox from "../src/tools/initialize";
import stopSandbox from "../src/tools/stop";

describe("runJs with listenOnPort", () => {
  it("should start a server in the container and expose it on the given port", async () => {
    const port = 3003;
    const start = await initializeSandbox({ port });
    const content = start.content[0];
    if (content.type !== "text") throw new Error("Unexpected content type");
    const containerId = content.text;

    try {
      const result = await runJs({
        container_id: containerId,
        code: `
          import Fastify from 'fastify';
          const app = Fastify();
          app.get('/', async () => 'ok');
          app.listen({ port: ${port}, host: '0.0.0.0' }, () => {
            console.log('Server started');
          });
        `,
        dependencies: [{ name: "fastify", version: "^4.0.0" }],
        listenOnPort: port,
      });

      console.log("Result:", JSON.stringify(result, null, 2));

      expect(result).toBeDefined();
      expect(result.content[0].type).toBe("text");

      if (result.content[0].type === "text") {
        expect(result.content[0].text).toContain(
          `Server started in background`
        );
      }

      // Wait for server to start
      await new Promise((res) => setTimeout(res, 3000));

      const res = await fetch(`http://localhost:${port}`);
      const body = await res.text();
      expect(body).toBe("ok");
    } finally {
      //await stopSandbox({ container_id: containerId });
    }
  }, 40000);
});
