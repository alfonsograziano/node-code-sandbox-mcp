import { z } from "zod";
import { execSync } from "child_process";
import tmp from "tmp";
import { randomUUID } from "crypto";
import { McpResponse, textContent } from "../types.js";
import {
  DEFAULT_NODE_IMAGE,
  DOCKER_NOT_RUNNING_ERROR,
  generateSuggestedImages,
  isDockerRunning,
  preprocessDependencies,
} from "../utils.js";
import { prepareWorkspace, getFilesDir } from "../runUtils.js";
import {
  changesToMcpContent,
  detectChanges,
  getSnapshot,
  getMountPointDir,
} from "../snapshotUtils.js";

const NodeDependency = z.object({
  name: z.string().describe("npm package name, e.g. lodash"),
  version: z.string().describe("npm package version range, e.g. ^4.17.21"),
});

export const argSchema = {
  image: z
    .string()
    .optional()
    .default(DEFAULT_NODE_IMAGE)
    .describe(
      "Docker image to use for ephemeral execution. e.g. " +
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
      "A list of npm dependencies to install before running the code. " +
        "Each item must have a `name` (package) and `version` (range). " +
        "If none, returns an empty array."
    ),
  code: z
    .string()
    .describe("JavaScript code to run inside the ephemeral container."),
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
    return {
      content: [textContent(DOCKER_NOT_RUNNING_ERROR)],
    };
  }

  const telemetry: Record<string, any> = {};

  const dependenciesRecord = preprocessDependencies({
    dependencies,
    image,
  });

  const containerId = `js-ephemeral-${randomUUID()}`;
  const tmpDir = tmp.dirSync({ unsafeCleanup: true });

  try {
    // Start an ephemeral container
    execSync(
      `docker run -d --network host --memory 512m --cpus 1 ` +
        `--workdir /workspace -v ${getFilesDir()}:/workspace/files ` +
        `--name ${containerId} ${image} tail -f /dev/null`
    );

    // Prepare workspace locally
    const localWorkspace = await prepareWorkspace({
      code,
      dependenciesRecord,
    });

    // Copy files into container
    execSync(`docker cp ${localWorkspace.name}/. ${containerId}:/workspace`);

    // Generate snapshot of the workspace
    const snapshotStartTime = Date.now();
    const snapshot = getSnapshot(getMountPointDir());

    // Run install and script inside container
    const installCmd = `npm install --omit=dev --prefer-offline --no-audit --loglevel=error`;
    const runCmd = `node index.js`;

    const installStart = Date.now();
    const installOutput = execSync(
      `docker exec ${containerId} /bin/sh -c ${JSON.stringify(installCmd)}`,
      { encoding: "utf8" }
    );
    telemetry.installTimeMs = Date.now() - installStart;
    telemetry.installOutput = installOutput;

    const runStart = Date.now();
    const rawOutput = execSync(
      `docker exec ${containerId} /bin/sh -c ${JSON.stringify(runCmd)}`,
      { encoding: "utf8" }
    );
    telemetry.runTimeMs = Date.now() - runStart;

    // Copy everything back out of the container
    execSync(`docker cp ${containerId}:/workspace/. ${tmpDir.name}`);

    // Detect the file changed during the execution of the tool in the mounted workspace
    // and report the changes to the user
    const extractedContents = await changesToMcpContent(
      detectChanges(snapshot, getMountPointDir(), snapshotStartTime)
    );

    return {
      content: [
        textContent(`Node.js process output:\n${rawOutput}`),
        ...extractedContents,
        textContent(`Telemetry:\n${JSON.stringify(telemetry, null, 2)}`),
      ],
    };
  } finally {
    execSync(`docker rm -f ${containerId}`);
    tmpDir.removeCallback();
  }
}
