import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { z } from "zod";
import { execSync } from "node:child_process";
import runJs, { argSchema } from "../src/tools/runJs";
import { DEFAULT_NODE_IMAGE } from "../src/utils";

let containerId: string;

beforeAll(() => {
  // Start a lightweight container
  containerId = execSync(
    `docker run -d --network host --memory 512m --cpus 1 --workdir /workspace ${DEFAULT_NODE_IMAGE} tail -f /dev/null`,
    { encoding: "utf-8" }
  ).trim();
});

afterAll(() => {
  if (containerId) {
    execSync(`docker rm -f ${containerId}`);
  }
});

describe("argSchema", () => {
  it("should accept code and container_id and set defaults", () => {
    const parsed = z.object(argSchema).parse({
      code: "console.log('hi');",
      container_id: "dummy",
    });
    expect(parsed.container_id).toBe("dummy");
    expect(parsed.dependencies).toEqual([]);
    expect(parsed.code).toBe("console.log('hi');");
  });
});

describe("runJs basic execution", () => {
  it("should run simple JS in container", async () => {
    const result = await runJs({
      container_id: containerId,
      code: `console.log("Hello from runJs")`,
    });

    expect(result).toBeDefined();
    expect(result.content.length).toBeGreaterThan(0);

    const output = result.content[0];
    expect(output.type).toBe("text");
    if (output.type === "text") {
      expect(output.text).toContain("Hello from runJs");
    }
  });

  it("should generate telemetry", async () => {
    const result = await runJs({
      container_id: containerId,
      code: "console.log('Hello telemetry!');",
    });

    const telemetryItem = result.content.find(
      (c) => c.type === "text" && c.text.startsWith("Telemetry:")
    );

    expect(telemetryItem).toBeDefined();
    if (telemetryItem?.type === "text") {
      const telemetry = JSON.parse(
        telemetryItem.text.replace("Telemetry:\n", "")
      );

      expect(telemetry).toHaveProperty("installTimeMs");
      expect(typeof telemetry.installTimeMs).toBe("number");
      expect(telemetry).toHaveProperty("runTimeMs");
      expect(typeof telemetry.runTimeMs).toBe("number");
      expect(telemetry).toHaveProperty("installOutput");
      expect(typeof telemetry.installOutput).toBe("string");
    } else {
      throw new Error("Expected telemetry item to be of type 'text'");
    }
  });

  it("should write and retrieve a file", async () => {
    const result = await runJs({
      container_id: containerId,
      code: `
        import fs from 'fs/promises';
        await fs.writeFile('test-output.txt', 'This is a test file!');
        console.log('File written');
      `,
    });

    const stdout = result.content.find((c) => c.type === "text");
    expect(stdout).toBeDefined();
    if (stdout?.type === "text") {
      expect(stdout.text).toContain("File written");
    }

    const fileText = result.content.find(
      (c) => c.type === "text" && c.text.includes("test-output.txt")
    );
    expect(fileText).toBeDefined();

    const resource = result.content.find(
      (c) =>
        c.type === "resource" &&
        "text" in c.resource &&
        c.resource.text === "test-output.txt"
    );
    expect(resource).toBeDefined();
    if (resource?.type === "resource") {
      expect(resource.resource.uri).toContain("test-output.txt");
    }
  });

  it("should install lodash and use it", async () => {
    const result = await runJs({
      container_id: containerId,
      code: `
        import _ from 'lodash';
        console.log(_.join(['Hello', 'lodash'], ' '));
      `,
      dependencies: [{ name: "lodash", version: "^4.17.21" }],
    });

    const stdout = result.content.find((c) => c.type === "text");
    expect(stdout).toBeDefined();
    if (stdout?.type === "text") {
      expect(stdout.text).toContain("Hello lodash");
    }
  });
});
