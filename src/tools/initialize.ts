import { z } from 'zod';
import { execSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { type McpResponse, textContent } from '../types.ts';
import {
  DEFAULT_NODE_IMAGE,
  DOCKER_NOT_RUNNING_ERROR,
  isDockerRunning,
  computeResourceLimits,
} from '../utils.ts';
import { getFilesDir } from '../runUtils.ts';
import { activeSandboxContainers } from '../containerUtils.ts';
import { logger } from '../logger.ts';

// Instead of importing serverRunId directly, we'll have a variable that gets set
let serverRunId = 'unknown';

// Function to set the serverRunId from the server.ts file
export function setServerRunId(id: string) {
  serverRunId = id;
}

export const argSchema = {
  image: z.string().optional(),
  port: z
    .number()
    .optional()
    .describe('If set, maps this container port to the host'),
};

export default async function initializeSandbox({
  image = DEFAULT_NODE_IMAGE,
  port,
}: {
  image?: string;
  port?: number;
}): Promise<McpResponse> {
  if (!isDockerRunning()) {
    return {
      content: [textContent(DOCKER_NOT_RUNNING_ERROR)],
    };
  }

  const containerId = `js-sbx-${randomUUID()}`;
  const creationTimestamp = Date.now();

  const portOption = port ? `-p ${port}:${port}` : `--network host`; // prefer --network host if no explicit port mapping

  // Construct labels
  const labels = [
    `mcp-sandbox=true`,
    `mcp-server-run-id=${serverRunId}`,
    `mcp-creation-timestamp=${creationTimestamp}`,
  ];
  const labelArgs = labels.map((label) => `--label "${label}"`).join(' ');
  const { memFlag, cpuFlag } = computeResourceLimits(image);

  try {
    execSync(
      `docker run -d ${portOption} ${memFlag} ${cpuFlag} ` +
        `--workdir /workspace -v ${getFilesDir()}:/workspace/files ` +
        `${labelArgs} ` + // Add labels here
        `--name ${containerId} ${image} tail -f /dev/null`
    );

    // Register the container only after successful creation
    activeSandboxContainers.set(containerId, creationTimestamp);
    logger.info(`Registered container ${containerId}`);

    return {
      content: [textContent(containerId)],
    };
  } catch (error) {
    logger.error(`Failed to initialize container ${containerId}`, error);
    // Ensure partial cleanup if execSync fails after container might be created but before registration
    try {
      execSync(`docker rm -f ${containerId}`);
    } catch (cleanupError: unknown) {
      // Ignore cleanup errors - log it just in case
      logger.warning(
        `Ignoring error during cleanup attempt for ${containerId}: ${String(cleanupError)}`
      );
    }
    return {
      content: [
        textContent(
          `Failed to initialize sandbox container: ${error instanceof Error ? error.message : String(error)}`
        ),
      ],
    };
  }
}
