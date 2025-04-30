import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";
import runJs from "../src/tools/runJs";
import { DEFAULT_NODE_IMAGE } from "../src/utils";

function startSandboxContainer(): string {
  return execSync(
    `docker run -d --network host --memory 512m --cpus 1 --workdir /workspace ${DEFAULT_NODE_IMAGE} tail -f /dev/null`,
    { encoding: "utf-8" }
  ).trim();
}

function stopSandboxContainer(containerId: string) {
  execSync(`docker rm -f ${containerId}`);
}

function extractInstallTime(outputText: string): number {
  const match = outputText.match(/NPM install took (\d+) ms/);
  if (!match) throw new Error("Could not extract install time from output");
  return parseInt(match[1], 10);
}

describe("runJs npm install benchmarking", () => {
  it("should install dependency faster on second run due to caching", async () => {
    const containerId = startSandboxContainer();

    try {
      const dependency = { name: "lodash", version: "^4.17.21" };

      // First run: benchmark install
      const result1 = await runJs({
        container_id: containerId,
        code: "console.log('Hello')",
        dependencies: [dependency],
        benchmarkInstallOnly: true,
      });

      const text1 = result1.content.find((c) => c.type === "text")?.text ?? "";
      const time1 = extractInstallTime(text1);

      // Second run: same install again, expect faster
      const result2 = await runJs({
        container_id: containerId,
        code: "", // not needed
        dependencies: [dependency],
        benchmarkInstallOnly: true,
      });

      const text2 = result2.content.find((c) => c.type === "text")?.text ?? "";
      const time2 = extractInstallTime(text2);

      // Assert that second install is faster
      try {
        expect(time2).toBeLessThan(time1 * 0.7); // At least 30% faster
      } catch (error) {
        console.error("Error in assertion:", error);
        console.log(`First install time: ${time1}ms`);
        console.log(`Second install time: ${time2}ms`);
        throw error; // Re-throw the error to fail the test
      }
    } finally {
      stopSandboxContainer(containerId);
    }
  }, 20_000);
});
