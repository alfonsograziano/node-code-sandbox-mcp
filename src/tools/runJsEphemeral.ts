import { z } from 'zod';
import { execSync } from 'child_process';
import tmp from 'tmp';
import { randomUUID } from 'crypto';
import { type McpResponse, textContent } from '../types.ts';
import {
  DEFAULT_NODE_IMAGE,
  DOCKER_NOT_RUNNING_ERROR,
  generateSuggestedImages,
  isDockerRunning,
  preprocessDependencies,
  computeResourceLimits,
} from '../utils.ts';
import { prepareWorkspace, getFilesDir } from '../runUtils.ts';
import {
  changesToMcpContent,
  detectChanges,
  getSnapshot,
  getMountPointDir,
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
  image: z
    .string()
    .optional()
    .default(DEFAULT_NODE_IMAGE)
    .describe(
      'Docker image to use for ephemeral execution. e.g. ' +
        generateSuggestedImages()
    ),
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
  code: z
    .string()
    .describe('JavaScript code to run inside the ephemeral container.'),
};

type NodeDependenciesArray = Array<{ name: string; version: string }>;

export default async function runJsEphemeral({
  image = DEFAULT_NODE_IMAGE,
  code,
  dependencies = [],
}: {
  image?: string;
  code: string;
  dependencies?: NodeDependenciesArray;
}): Promise<McpResponse> {
  if (!isDockerRunning()) {
    return { content: [textContent(DOCKER_NOT_RUNNING_ERROR)] };
  }

  const telemetry: Record<string, unknown> = {};
  const dependenciesRecord = preprocessDependencies({ dependencies, image });
  const containerId = `js-ephemeral-${randomUUID()}`;
  const tmpDir = tmp.dirSync({ unsafeCleanup: true });
  const { memFlag, cpuFlag } = computeResourceLimits(image);

  try {
    // Start an ephemeral container
    execSync(
      `docker run -d --network host ${memFlag} ${cpuFlag} ` +
        `--workdir /workspace -v ${getFilesDir()}:/workspace/files ` +
        `--name ${containerId} ${image} tail -f /dev/null`
    );

    // Prepare workspace locally
    const localWorkspace = await prepareWorkspace({ code, dependenciesRecord });
    execSync(`docker cp ${localWorkspace.name}/. ${containerId}:/workspace`);

    // Generate snapshot of the workspace
    const snapshotStartTime = Date.now();
    const snapshot = await getSnapshot(getMountPointDir());

    // Run install and script inside container
    const installCmd =
      'npm install --omit=dev --prefer-offline --no-audit --loglevel=error';

    if (dependencies.length > 0) {
      const installStart = Date.now();
      const installOutput = execSync(
        `docker exec ${containerId} /bin/sh -c ${JSON.stringify(installCmd)}`,
        { encoding: 'utf8' }
      );
      telemetry.installTimeMs = Date.now() - installStart;
      telemetry.installOutput = installOutput;
    } else {
      telemetry.installTimeMs = 0;
      telemetry.installOutput = 'Skipped npm install (no dependencies)';
    }

    const { output, error, duration } = safeExecNodeInContainer({
      containerId,
    });
    telemetry.runTimeMs = duration;
    if (error) return getContentFromError(error, telemetry);

    // Detect the file changed during the execution of the tool in the mounted workspace
    // and report the changes to the user
    const changes = await detectChanges(
      snapshot,
      getMountPointDir(),
      snapshotStartTime
    );

    const extractedContents = await changesToMcpContent(changes);

    return {
      content: [
        textContent(`Node.js process output:\n${output}`),
        ...extractedContents,
        textContent(`Telemetry:\n${JSON.stringify(telemetry, null, 2)}`),
      ],
    };
  } finally {
    execSync(`docker rm -f ${containerId}`);
    tmpDir.removeCallback();
  }
}
