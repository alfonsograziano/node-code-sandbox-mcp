import { z } from 'zod';
import { McpResponse, textContent } from '../types.js';
import { DOCKER_NOT_RUNNING_ERROR, isDockerRunning } from '../utils.js';
import { forceStopContainer } from '../server.js';

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

  await forceStopContainer(container_id);

  return {
    content: [textContent(`Container ${container_id} stop requested.`)],
  };
}
