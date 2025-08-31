import { z } from 'zod';
import { execFileSync } from 'node:child_process';
import { type McpResponse, textContent, type McpContent } from '../types.ts';
import { prepareWorkspace } from '../runUtils.ts';
import {
  DOCKER_NOT_RUNNING_ERROR,
  isDockerRunning,
  waitForPortHttp,
  sanitizeContainerId,
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
import { lintAndRefactorCode } from '../linterUtils.ts';

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
  const validId = sanitizeContainerId(container_id);
  if (!validId) {
    return { content: [textContent('Invalid container ID')] };
  }

  if (!isDockerRunning()) {
    return { content: [textContent(DOCKER_NOT_RUNNING_ERROR)] };
  }

  // Lint and refactor the code first.
  const { fixedCode, errorReport } = await lintAndRefactorCode(code);

  const telemetry: Record<string, unknown> = {};
  const dependenciesRecord: Record<string, string> = Object.fromEntries(
    dependencies.map(({ name, version }) => [name, version])
  );

  // Create workspace in container
  const localWorkspace = await prepareWorkspace({
    code: fixedCode,
    dependenciesRecord,
  });
  execFileSync('docker', [
    'cp',
    `${localWorkspace.name}/.`,
    `${validId}:/workspace`,
  ]);

  let rawOutput: string = '';

  // Generate snapshot of the workspace
  const snapshotStartTime = Date.now();
  const snapshot = await getSnapshot(getMountPointDir());

  if (listenOnPort) {
    if (dependencies.length > 0) {
      const installStart = Date.now();
      const installOutput = execFileSync(
        'docker',
        [
          'exec',
          validId,
          '/bin/sh',
          '-c',
          'npm install --omit=dev --prefer-offline --no-audit --loglevel=error',
        ],
        { encoding: 'utf8' }
      );
      telemetry.installTimeMs = Date.now() - installStart;
      telemetry.installOutput = installOutput;
    } else {
      telemetry.installTimeMs = 0;
      telemetry.installOutput = 'Skipped npm install (no dependencies)';
    }

    const { error, duration } = safeExecNodeInContainer({
      containerId: validId,
      command: `nohup node index.js > output.log 2>&1 &`,
    });
    telemetry.runTimeMs = duration;
    if (error) {
      const errorResponse = getContentFromError(error, telemetry);
      if (errorReport) {
        errorResponse.content.unshift(
          textContent(
            `Linting issues found (some may have been auto-fixed):\n${errorReport}`
          )
        );
      }
      return errorResponse;
    }

    await waitForPortHttp(listenOnPort);
    rawOutput = `Server started in background; logs at /output.log`;
  } else {
    if (dependencies.length > 0) {
      const installStart = Date.now();
      const fullCmd =
        'npm install --omit=dev --prefer-offline --no-audit --loglevel=error';
      const installOutput = execFileSync(
        'docker',
        ['exec', validId, '/bin/sh', '-c', fullCmd],
        { encoding: 'utf8' }
      );
      telemetry.installTimeMs = Date.now() - installStart;
      telemetry.installOutput = installOutput;
    } else {
      telemetry.installTimeMs = 0;
      telemetry.installOutput = 'Skipped npm install (no dependencies)';
    }

    const { output, error, duration } = safeExecNodeInContainer({
      containerId: validId,
    });

    if (output) rawOutput = output;
    telemetry.runTimeMs = duration;
    if (error) {
      const errorResponse = getContentFromError(error, telemetry);
      if (errorReport) {
        errorResponse.content.unshift(
          textContent(
            `Linting issues found (some may have been auto-fixed):\n${errorReport}`
          )
        );
      }
      return errorResponse;
    }
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

  const responseContent: McpContent[] = [];
  if (errorReport) {
    responseContent.push(
      textContent(
        `Linting issues found (some may have been auto-fixed):\n${errorReport}`
      )
    );
  }

  return {
    content: [
      ...(responseContent.length ? responseContent : []),
      textContent(`Node.js process output:\n${rawOutput}`),
      ...extractedContents,
      textContent(`Telemetry:\n${JSON.stringify(telemetry, null, 2)}`),
    ],
  };
}
