import { z } from 'zod';
import { execSync } from 'node:child_process';
import { type McpResponse, textContent } from '../types.ts';
import { DOCKER_NOT_RUNNING_ERROR, isDockerRunning } from '../utils.ts';

export const argSchema = {
  container_id: z.string(),
  commands: z.array(z.string().min(1)),
};

export default async function execInSandbox({
  container_id,
  commands,
}: {
  container_id: string;
  commands: string[];
}): Promise<McpResponse> {
  if (!isDockerRunning()) {
    return {
      content: [textContent(DOCKER_NOT_RUNNING_ERROR)],
    };
  }

  const output: string[] = [];
  for (const cmd of commands) {
    output.push(
      execSync(
        `docker exec ${container_id} /bin/sh -c ${JSON.stringify(cmd)}`,
        {
          encoding: 'utf8',
        }
      )
    );
  }
  return { content: [textContent(output.join('\n'))] };
}
