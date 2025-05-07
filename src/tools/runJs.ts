import { z } from 'zod';
import { execSync } from 'node:child_process';
import { type McpResponse, textContent } from '../types.ts';
import { prepareWorkspace } from '../runUtils.ts';
import {
  DOCKER_NOT_RUNNING_ERROR,
  isDockerRunning,
  waitForPortHttp,
} from '../utils.ts';
import {
  changesToMcpContent,
  detectChanges,
  getMountPointDir,
  getSnapshot,
} from '../snapshotUtils.ts';
import {
  getContentFromError,
  safeExecNodeInContainer,
} from '../dockerUtils.ts';

const NodeDependency = z.object({
  name: z.string().describe('npm package name, e.g. lodash'),
  version: z.string().describe('npm package version range, e.g. ^4.17.21'),
});

export const argSchema = {
  container_id: z.string().describe('Docker container identifier'),
  // We use an array of { name, version } items instead of a record
  // because the OpenAI function-calling schema doesn’t reliably support arbitrary
  // object keys. An explicit array ensures each dependency has a clear, uniform
  // structure the model can populate.
  // Schema for a single dependency item
  dependencies: z
    .array(NodeDependency)
    .default([])
    .describe(
      'A list of npm dependencies to install before running the code. ' +
        'Each item must have a `name` (package) and `version` (range). ' +
        'If none, returns an empty array.'
    ),
  code: z.string().describe('JavaScript code to run inside the container.'),
  listenOnPort: z
    .number()
    .optional()
    .describe(
      'If set, leaves the process running and exposes this port to the host.'
    ),
};

type DependenciesArray = Array<{ name: string; version: string }>;

export default async function runJs({
  container_id,
  code,
  dependencies = [],
  listenOnPort,
}: {
  container_id: string;
  code: string;
  dependencies?: DependenciesArray;
  listenOnPort?: number;
}): Promise<McpResponse> {
  if (!isDockerRunning()) {
    return { content: [textContent(DOCKER_NOT_RUNNING_ERROR)] };
  }

  const telemetry: Record<string, unknown> = {};
  const dependenciesRecord: Record<string, string> = Object.fromEntries(
    dependencies.map(({ name, version }) => [name, version])
  );

  // Create workspace in container
  const localWorkspace = await prepareWorkspace({ code, dependenciesRecord });
  execSync(`docker cp ${localWorkspace.name}/. ${container_id}:/workspace`);

  let rawOutput: string = '';

  // Generate snapshot of the workspace
  const snapshotStartTime = Date.now();
  const snapshot = await getSnapshot(getMountPointDir());

  if (listenOnPort) {
    if (dependencies.length > 0) {
      const installStart = Date.now();
      const installOutput = execSync(
        `docker exec ${container_id} /bin/sh -c ${JSON.stringify(
          `npm install --omit=dev --prefer-offline --no-audit --loglevel=error`
        )}`,
        { encoding: 'utf8' }
      );
      telemetry.installTimeMs = Date.now() - installStart;
      telemetry.installOutput = installOutput;
    } else {
      telemetry.installTimeMs = 0;
      telemetry.installOutput = 'Skipped npm install (no dependencies)';
    }

    const { error, duration } = safeExecNodeInContainer({
      containerId: container_id,
      command: `nohup node index.js > output.log 2>&1 &`,
    });
    telemetry.runTimeMs = duration;
    if (error) return getContentFromError(error, telemetry);

    await waitForPortHttp(listenOnPort);
    rawOutput = `Server started in background; logs at /output.log`;
  } else {
    if (dependencies.length > 0) {
      const installStart = Date.now();
      const fullCmd = `npm install --omit=dev --prefer-offline --no-audit --loglevel=error`;
      const installOutput = execSync(
        `docker exec ${container_id} /bin/sh -c ${JSON.stringify(fullCmd)}`,
        { encoding: 'utf8' }
      );
      telemetry.installTimeMs = Date.now() - installStart;
      telemetry.installOutput = installOutput;
    } else {
      telemetry.installTimeMs = 0;
      telemetry.installOutput = 'Skipped npm install (no dependencies)';
    }

    const { output, error, duration } = safeExecNodeInContainer({
      containerId: container_id,
    });

    if (output) rawOutput = output;
    telemetry.runTimeMs = duration;
    if (error) return getContentFromError(error, telemetry);
  }

  // Detect the file changed during the execution of the tool in the mounted workspace
  // and report the changes to the user
  const changes = await detectChanges(
    snapshot,
    getMountPointDir(),
    snapshotStartTime
  );

  const extractedContents = await changesToMcpContent(changes);
  localWorkspace.removeCallback();

  return {
    content: [
      textContent(`Node.js process output:\n${rawOutput}`),
      ...extractedContents,
      textContent(`Telemetry:\n${JSON.stringify(telemetry, null, 2)}`),
    ],
  };
}
