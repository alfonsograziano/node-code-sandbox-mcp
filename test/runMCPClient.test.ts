import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { tmpdir } from "os";
import { mkdtempSync, writeFileSync, rmSync } from "fs";
import path from "path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import dotenv from "dotenv";
import fs from "fs";
import { describeIfLocal } from "./utils";
dotenv.config();

// Skipping this on the CI because it requires a docker image which is not
// available in the CI environment because has been built for arm64
// and the CI is running on x86_64
describeIfLocal(
  "runJsEphemeral via MCP client (files)",
  () => {
    let workspaceDir: string;
    let client: Client;

    beforeAll(async () => {
      workspaceDir = mkdtempSync(path.join(tmpdir(), "ws-"));
      client = new Client({ name: "node_js_sandbox_test", version: "1.0.0" });

      await client.connect(
        new StdioClientTransport({
          command: "docker",
          args: [
            "run",
            "-i",
            "--rm",
            "-v",
            "/var/run/docker.sock:/var/run/docker.sock",
            "-v",
            `${workspaceDir}:/root`,
            "-e",
            `JS_SANDBOX_OUTPUT_DIR=${workspaceDir}`,
            "alfonsograziano/node-code-sandbox-mcp",
          ],
        })
      );
    });

    afterAll(() => {
      rmSync(workspaceDir, { recursive: true, force: true });
    });

    it("should run a console.log", async () => {
      const code = `console.log("Hello from workspace!");`;

      const result = (await client.callTool({
        name: "run_js_ephemeral",
        arguments: { code, dependencies: [] },
      })) as { content: Array<{ type: string; text: string }> };

      expect(result).toBeDefined();
      expect(result.content).toBeInstanceOf(Array);
      expect(result.content[0]).toMatchObject({
        type: "text",
      });

      const outputText = result.content[0].text;
      expect(outputText).toContain("Hello from workspace!");
      expect(outputText).toContain("Node.js process output");
    });

    it("should write a file to the host system", async () => {
      const filePath = "test-output_from_MCP.txt";
      const expectedContent = "This is written from the sandbox.";

      const code = `
      import fs from "fs";
      fs.writeFileSync("${filePath}", "${expectedContent}");
      console.log("File written.");
    `;

      const result = await client.callTool({
        name: "run_js_ephemeral",
        arguments: { code, dependencies: [] },
      });

      expect(result).toBeDefined();
      expect(result.content?.[0]?.text || "").toContain("File written.");

      const writtenFilePath = path.join(workspaceDir, filePath);
      const fileExists = fs.existsSync(writtenFilePath);
      expect(fileExists).toBe(true);

      const actualContent = fs.readFileSync(writtenFilePath, "utf-8");
      expect(actualContent).toBe(expectedContent);
    });
  },
  20_000
);
