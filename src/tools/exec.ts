import { z } from 'zod';
import { execFileSync } from 'node:child_process';
import { type McpResponse, textContent } from '../types.ts';
import {
  DOCKER_NOT_RUNNING_ERROR,
  isDockerRunning,
  sanitizeContainerId,
  sanitizeShellCommand,
} from '../utils.ts';

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
  const validId = sanitizeContainerId(container_id);
  if (!validId) {
    return {
      content: [textContent('Invalid container ID')],
    };
  }

  if (!isDockerRunning()) {
    return {
      content: [textContent(DOCKER_NOT_RUNNING_ERROR)],
    };
  }

  const output: string[] = [];
  for (const cmd of commands) {
    const sanitizedCmd = sanitizeShellCommand(cmd);
    if (!sanitizedCmd)
      throw new Error(
        'Cannot run command as it contains dangerous metacharacters'
      );
    output.push(
      execFileSync('docker', ['exec', validId, '/bin/sh', '-c', sanitizedCmd], {
        encoding: 'utf8',
      })
    );
  }
  return { content: [textContent(output.join('\n'))] };
}
