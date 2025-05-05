import { z } from 'zod';
import { McpResponse, textContent } from '../types.js';
import { DOCKER_NOT_RUNNING_ERROR, isDockerRunning } from '../utils.js';
import { forceStopContainer as dockerForceStopContainer } from '../dockerUtils.js';
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

  await dockerForceStopContainer(container_id);
  activeSandboxContainers.delete(container_id);
  console.log(`[stopSandbox] Removed container ${container_id} from registry.`);

  return {
    content: [textContent(`Container ${container_id} stop requested.`)],
  };
}
