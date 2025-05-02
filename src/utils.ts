import { existsSync, readFileSync } from "fs";
import { execSync } from "node:child_process";

export function isRunningInDocker() {
  // 1. The “/.dockerenv” sentinel file
  if (existsSync("/.dockerenv")) return true;

  // 2. cgroup data often embeds “docker” or “kubepods”
  try {
    const cgroup = readFileSync("/proc/1/cgroup", "utf8");
    if (cgroup.includes("docker") || cgroup.includes("kubepods")) {
      return true;
    }
  } catch (err) {
    // unreadable or missing → assume “not”
  }

  return false;
}

export function preprocessDependencies({
  dependencies,
  image,
}: {
  dependencies: Array<{ name: string; version: string }>;
  image?: string;
}): Record<string, string> {
  const dependenciesRecord: Record<string, string> = Object.fromEntries(
    dependencies.map(({ name, version }) => [name, version])
  );

  // This image has a pre-cached version of chartjs-node-canvas,
  // but we still need to explicitly declare it in package.json
  if (image?.includes("alfonsograziano/node-chartjs-canvas")) {
    dependenciesRecord["chartjs-node-canvas"] = "4.0.0";
  }

  return dependenciesRecord;
}

export const DEFAULT_NODE_IMAGE = "node:lts-slim";

export const suggestedImages = {
  "node:lts-slim": {
    description: "Node.js LTS version, slim variant.",
    reason: "Lightweight and fast for JavaScript execution tasks.",
  },
  "mcr.microsoft.com/playwright:v1.52.0-noble": {
    description: "Playwright image for browser automation.",
    reason: "Preconfigured for running Playwright scripts.",
  },
  "alfonsograziano/node-chartjs-canvas:latest": {
    description: "Chart.js image for chart generation.",
    reason: "Preconfigured for generating charts with chartjs-node-canvas.",
  },
};

export const generateSuggestedImages = () => {
  return Object.entries(suggestedImages)
    .map(([image, { description, reason }]) => {
      return `- **${image}**: ${description} (${reason})`;
    })
    .join("\n");
};

export async function waitForPortHttp(
  port: number,
  timeoutMs = 10_000,
  intervalMs = 250
): Promise<void> {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`http://localhost:${port}`);
      if (res.ok || res.status === 404) return; // server is up
    } catch {
      // server not ready
    }

    await new Promise((r) => setTimeout(r, intervalMs));
  }

  throw new Error(
    `Timeout: Server did not respond on http://localhost:${port} within ${timeoutMs}ms`
  );
}

export function isDockerRunning() {
  try {
    execSync("docker info");
    return true;
  } catch (e) {
    return false;
  }
}
export const DOCKER_NOT_RUNNING_ERROR =
  "Error: Docker is not running. Please start Docker and try again.";
