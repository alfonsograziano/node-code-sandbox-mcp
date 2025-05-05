import { z } from 'zod';
import { execSync } from 'node:child_process';
import { McpResponse, textContent } from '../types.js';
import { DOCKER_NOT_RUNNING_ERROR, isDockerRunning } from '../utils.js';
import { activeSandboxContainers } from '../containerUtils.js';

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

  // Directly use execSync for removing the container as expected by the test
  execSync(`docker rm -f ${container_id}`);
  activeSandboxContainers.delete(container_id);
  console.log(`[stopSandbox] Removed container ${container_id} from registry.`);

  return {
    content: [textContent(`Container ${container_id} removed.`)],
  };
}
