import { describe, it, expect, beforeAll, afterAll } from "vitest";
import initializeSandbox from "../src/tools/initialize";
import execInSandbox from "../src/tools/exec";
import stopSandbox from "../src/tools/stop";

let containerId: string;

beforeAll(async () => {
  const result = await initializeSandbox({});
  const content = result.content[0];
  if (content.type !== "text") throw new Error("Unexpected content type");
  containerId = content.text;
});

afterAll(async () => {
  await stopSandbox({ container_id: containerId });
});

describe("execInSandbox", () => {
  it("should execute a single command and return its output", async () => {
    const result = await execInSandbox({
      container_id: containerId,
      commands: ["echo Hello"],
    });

    expect(result.content[0].type).toBe("text");
    if (result.content[0].type === "text") {
      expect(result.content[0].text.trim()).toBe("Hello");
    } else {
      throw new Error("Unexpected content type");
    }
  });

  it("should execute multiple commands and join their outputs", async () => {
    const result = await execInSandbox({
      container_id: containerId,
      commands: ["echo First", "echo Second"],
    });

    let output: string[] = [];
    if (result.content[0].type === "text") {
      output = result.content[0].text.trim().split("\n");
      expect(output).toEqual(["First", "", "Second"]);
    } else {
      throw new Error("Unexpected content type");
    }
  });

  it("should handle command with special characters", async () => {
    const result = await execInSandbox({
      container_id: containerId,
      commands: ['echo "Special: $HOME"'],
    });

    if (result.content[0].type === "text") {
      expect(result.content[0].text.trim()).toContain("Special:");
    } else {
      throw new Error("Unexpected content type");
    }
  });
});
