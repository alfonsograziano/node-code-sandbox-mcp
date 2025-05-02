import { z } from "zod";
import { execSync } from "node:child_process";
import { randomUUID } from "crypto";
import { McpResponse, textContent } from "../types.js";
import {
  prepareWorkspace,
  extractOutputsFromDir,
  getHostOutputDir,
} from "../runUtils.js";
import tmp from "tmp";
import {
  DOCKER_NOT_RUNNING_ERROR,
  isDockerRunning,
  waitForPortHttp,
} from "../utils.js";

const NodeDependency = z.object({
  name: z.string().describe("npm package name, e.g. lodash"),
  version: z.string().describe("npm package version range, e.g. ^4.17.21"),
});

export const argSchema = {
  container_id: z.string().describe("Docker container identifier"),
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
  code: z.string().describe("JavaScript code to run inside the container."),
  listenOnPort: z
    .number()
    .optional()
    .describe(
      "If set, leaves the process running and exposes this port to the host."
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
    return {
      content: [textContent(DOCKER_NOT_RUNNING_ERROR)],
    };
  }

  const telemetry: Record<string, any> = {};

  const dependenciesRecord: Record<string, string> = Object.fromEntries(
    dependencies.map(({ name, version }) => [name, version])
  );

  const dirName = `job-${Date.now()}-${randomUUID()}`;
  const containerWorkdir = `/workspace/${dirName}`;

  // 1. Create workspace folder inside container
  execSync(`docker exec ${container_id} mkdir -p ${containerWorkdir}`);

  // 2. Prepare local files using shared utility
  const localWorkspace = await prepareWorkspace({
    code,
    dependenciesRecord,
  });

  // 3. Copy into container
  execSync(
    `docker cp ${localWorkspace.name}/. ${container_id}:${containerWorkdir}`
  );

  let rawOutput: string;
  if (listenOnPort) {
    const installStart = Date.now();
    // Install dependencies first
    const installOutput = execSync(
      `docker exec ${container_id} /bin/sh -c ${JSON.stringify(
        `cd ${containerWorkdir} && npm install --omit=dev --prefer-offline --no-audit --loglevel=error`
      )}`,
      { encoding: "utf8" }
    );
    telemetry.installTimeMs = Date.now() - installStart;
    telemetry.installOutput = installOutput;

    // Run the script in the background and leave the port open
    const runScript = `
      cd ${containerWorkdir} && \
      nohup node index.js > output.log 2>&1 &
    `
      .trim()
      .replace(/\n\s+/g, " ");

    execSync(
      `docker exec ${container_id} /bin/sh -c ${JSON.stringify(runScript)}`
    );

    await waitForPortHttp(listenOnPort);

    rawOutput = `Server started in background and listening on port ${listenOnPort}. Logs: ${containerWorkdir}/output.log`;
  } else {
    const installStart = Date.now();
    const fullCmd = `
      cd ${containerWorkdir} && 
      npm install --omit=dev --prefer-offline --no-audit --loglevel=error
    `
      .trim()
      .replace(/\n\s+/g, " ");

    const installOutput = execSync(
      `docker exec ${container_id} /bin/sh -c '${fullCmd}'`,
      {
        encoding: "utf8",
      }
    );
    telemetry.installTimeMs = Date.now() - installStart;
    telemetry.installOutput = installOutput;

    const runStart = Date.now();
    const runCmd = `
      cd ${containerWorkdir} && 
      node index.js
    `
      .trim()
      .replace(/\n\s+/g, " ");

    rawOutput = execSync(`docker exec ${container_id} /bin/sh -c '${runCmd}'`, {
      encoding: "utf8",
    });
    telemetry.runTimeMs = Date.now() - runStart;
  }

  const tmpOutput = tmp.dirSync({ unsafeCleanup: true });
  execSync(`docker cp ${container_id}:${containerWorkdir}/. ${tmpOutput.name}`);

  // Cleanup unless we expect the process to still be running
  if (!listenOnPort) {
    execSync(`docker exec ${container_id} rm -rf ${containerWorkdir}`);
  }

  const outputDir = getHostOutputDir();
  const extractedContents = await extractOutputsFromDir({
    dirPath: tmpOutput.name,
    outputDir,
  });

  tmpOutput.removeCallback();
  localWorkspace.removeCallback();

  return {
    content: [
      textContent(`Node.js process output:\n${rawOutput}`),
      ...extractedContents,
      textContent(`Telemetry:\n${JSON.stringify(telemetry, null, 2)}`),
    ],
  };
}
