import { existsSync, readFileSync } from 'fs';
import { execSync } from 'node:child_process';
import { getConfig } from './config.ts';

export function isRunningInDocker() {
  // 1. The "/.dockerenv" sentinel file
  if (existsSync('/.dockerenv')) return true;

  // 2. cgroup data often embeds "docker" or "kubepods"
  try {
    if (existsSync('/proc/1/cgroup')) {
      const cgroup = readFileSync('/proc/1/cgroup', 'utf8');
      if (cgroup.includes('docker') || cgroup.includes('kubepods')) {
        return true;
      }
    }
  } catch {
    // unreadable or missing → assume "not"
  }

  // 3. Check for environment variables commonly set in Docker
  if (process.env.DOCKER_CONTAINER || process.env.DOCKER_ENV) {
    return true;
  }

  // On macOS or Windows for tests, just return false
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
  if (image?.includes('alfonsograziano/node-chartjs-canvas')) {
    dependenciesRecord['chartjs-node-canvas'] = '4.0.0';
    dependenciesRecord['@mermaid-js/mermaid-cli'] = '^11.4.2';
  }

  return dependenciesRecord;
}

export const DEFAULT_NODE_IMAGE = 'node:lts-slim';

export const suggestedImages = {
  'node:lts-slim': {
    description: 'Node.js LTS version, slim variant.',
    reason: 'Lightweight and fast for JavaScript execution tasks.',
  },
  'mcr.microsoft.com/playwright:v1.52.0-noble': {
    description: 'Playwright image for browser automation.',
    reason: 'Preconfigured for running Playwright scripts.',
  },
  'alfonsograziano/node-chartjs-canvas:latest': {
    description:
      'Chart.js image for chart generation and mermaid charts generation.',
    reason: `'Preconfigured for generating charts with chartjs-node-canvas and Mermaid. Minimal Mermaid example:
    import fs from "fs";
    import { run } from "@mermaid-js/mermaid-cli";
    fs.writeFileSync("./files/diagram.mmd", "graph LR; A-->B;", "utf8");
    await run("./files/diagram.mmd", "./files/diagram.svg");`,
  },
};

export const generateSuggestedImages = () => {
  return Object.entries(suggestedImages)
    .map(([image, { description, reason }]) => {
      return `- **${image}**: ${description} (${reason})`;
    })
    .join('\n');
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
    execSync('docker info');
    return true;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return false;
  }
}
export const DOCKER_NOT_RUNNING_ERROR =
  'Error: Docker is not running. Please start Docker and try again.';

export interface Limits {
  memory?: string;
  cpus?: string;
}

export const IMAGE_DEFAULTS: Record<string, Limits> = {
  'node:lts-slim': { memory: '512m', cpus: '1' },
  'alfonsograziano/node-chartjs': { memory: '2g', cpus: '2' },
  'mcr.microsoft.com/playwright': { memory: '2g', cpus: '2' },
};

export function computeResourceLimits(image: string) {
  const base = { memFlag: '', cpuFlag: '' };
  if (!image) return base;

  const def =
    Object.entries(IMAGE_DEFAULTS).find(([key]) => image.includes(key))?.[1] ??
    {};

  const memory = getConfig().rawMemoryLimit ?? def.memory;
  const cpus = getConfig().rawCpuLimit ?? def.cpus;

  return {
    ...base,
    memFlag: memory ? `--memory ${memory}` : '',
    cpuFlag: cpus ? `--cpus ${cpus}` : '',
  };
}
