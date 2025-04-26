import { z } from "zod";
import { execSync } from "node:child_process";
import fs from "fs/promises";
import path from "path";
import tmp from "tmp";
import { randomUUID } from "crypto";
import { McpResponse, textContent } from "../types";

// Schema for a single dependency item
const DependencyItem = z.object({
  name: z.string().describe("npm package name, e.g. lodash"),
  version: z.string().describe("npm package version range, e.g. ^4.17.21"),
});

export const argSchema = {
  container_id: z.string().describe("Docker container identifier"),
  code: z
    .string()
    .describe("JavaScript code to run inside the ephemeral container."),
  dependencies: z
    .array(DependencyItem)
    .default([])
    .describe(
      "A list of npm dependencies to install before running the code. " +
        "Each item must have a `name` (package) and `version` (range). " +
        "If none, returns an empty array."
    ),
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
  // Convert array of { name, version } into record for package.json
  const dependenciesRecord: Record<string, string> = Object.fromEntries(
    dependencies.map(({ name, version }) => [name, version])
  );

  // 1. Create a unique workspace directory inside the container
  const dirName = `job-${Date.now()}-${randomUUID()}`;
  execSync(`docker exec ${container_id} mkdir -p /workspace/${dirName}`);

  // 2. Prepare local temporary build context
  const localTmp = tmp.dirSync({ unsafeCleanup: true });
  await fs.writeFile(path.join(localTmp.name, "index.js"), code);
  await fs.writeFile(
    path.join(localTmp.name, "package.json"),
    JSON.stringify(
      { type: "module", dependencies: dependenciesRecord },
      null,
      2
    )
  );

  // 3. Copy files into container
  execSync(
    `docker cp ${localTmp.name}/. ${container_id}:/workspace/${dirName}`
  );

  // 4. Install dependencies and execute code
  const installCmd = `cd /workspace/${dirName} && npm install --omit=dev --ignore-scripts --no-audit --loglevel=error`;
  const runCmd = `node /workspace/${dirName}/index.js`;
  const fullCmd = `${installCmd} && ${runCmd}`;

  const result = execSync(
    `docker exec ${container_id} /bin/sh -c ${JSON.stringify(fullCmd)}`,
    { encoding: "utf8" }
  );

  // 5. Cleanup workspace inside container and local temp
  execSync(`docker exec ${container_id} rm -rf /workspace/${dirName}`);
  localTmp.removeCallback();

  return { content: [textContent(result)] };
}
