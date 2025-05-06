import { z } from 'zod';
import { execSync } from 'node:child_process';
import { type McpResponse, textContent } from '../types.ts';
import { DOCKER_NOT_RUNNING_ERROR, isDockerRunning } from '../utils.ts';
import { activeSandboxContainers } from '../containerUtils.ts';

export const argSchema = { container_id: z.string() };

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

  try {
    // Directly use execSync for removing the container as expected by the test
    execSync(`docker rm -f ${container_id}`);
    activeSandboxContainers.delete(container_id);
    // console.log(
    //   `[stopSandbox] Removed container ${container_id} from registry.`
    // );

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
    activeSandboxContainers.delete(container_id);

    return {
      content: [
        textContent(
          `Error removing container ${container_id}: ${errorMessage}`
        ),
      ],
    };
  }
}
