import { z } from 'zod';
import { execFileSync } from 'node:child_process';
import { type McpResponse, textContent } from '../types.ts';
import {
  DOCKER_NOT_RUNNING_ERROR,
  isDockerRunning,
  sanitizeContainerId,
} from '../utils.ts';
import { activeSandboxContainers } from '../containerUtils.ts';

export const argSchema = {
  container_id: z.string().regex(/^[a-zA-Z0-9_.-]+$/, 'Invalid container ID'),
};

export default async function stopSandbox({
  container_id,
}: {
  container_id: string;
}): Promise<McpResponse> {
  if (!isDockerRunning()) {
    return {
      content: [textContent(DOCKER_NOT_RUNNING_ERROR)],
    };
  }

  const validId = sanitizeContainerId(container_id);
  if (!validId) {
    return {
      content: [textContent('Invalid container ID')],
    };
  }

  try {
    // Use execFileSync with validated container_id
    execFileSync('docker', ['rm', '-f', validId]);
    activeSandboxContainers.delete(validId);

    return {
      content: [textContent(`Container ${container_id} removed.`)],
    };
  } catch (error) {
    // Handle any errors that occur during container removal
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(
      `[stopSandbox] Error removing container ${container_id}: ${errorMessage}`
    );

    // Still remove from our registry even if Docker command failed
    activeSandboxContainers.delete(validId);

    return {
      content: [
        textContent(
          `Error removing container ${container_id}: ${errorMessage}`
        ),
      ],
    };
  }
}
