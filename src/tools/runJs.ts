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
};

type DependenciesArray = Array<{ name: string; version: string }>;

export default async function runJs({
  container_id,
  code,
  dependencies = [],
}: {
  container_id: string;
  code: string;
  dependencies?: DependenciesArray;
}): Promise<McpResponse> {
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

  // 4. Run install + script
  const installCmd = `cd ${containerWorkdir} && npm install --omit=dev --prefer-offline --no-audit --loglevel=error`;
  const runCmd = `node ${containerWorkdir}/index.js`;
  const fullCmd = `${installCmd} && ${runCmd}`;

  const rawOutput = execSync(
    `docker exec ${container_id} /bin/sh -c ${JSON.stringify(fullCmd)}`,
    { encoding: "utf8" }
  );

  // 5. Copy output files back out of container
  const tmpOutput = tmp.dirSync({ unsafeCleanup: true });
  execSync(`docker cp ${container_id}:${containerWorkdir}/. ${tmpOutput.name}`);

  // 6. Cleanup inside the container
  execSync(`docker exec ${container_id} rm -rf ${containerWorkdir}`);

  // 7. Parse and return output
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
    ],
  };
}
