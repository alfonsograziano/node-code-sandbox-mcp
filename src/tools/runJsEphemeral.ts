import { z } from "zod";
import { execSync } from "child_process";
import fs from "fs/promises";
import path from "path";
import tmp from "tmp";
import { randomUUID } from "crypto";
import { McpResponse, textContent } from "../types.js";

const NodeDependency = z.object({
  name: z.string().describe("npm package name, e.g. lodash"),
  version: z.string().describe("npm package version range, e.g. ^4.17.21"),
});

export const argSchema = {
  image: z
    .string()
    .optional()
    .default("node:20-slim")
    .describe(
      'Docker image to use for ephemeral execution, e.g. "node:20-slim"'
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
  image = "node:20-slim",
  code,
  dependencies = [],
}: {
  image?: string;
  code: string;
  dependencies?: NodeDependenciesArray;
}): Promise<McpResponse> {
  // Convert array of { name, version } into dependencies object
  const dependenciesRecord: Record<string, string> = Object.fromEntries(
    dependencies.map(({ name, version }) => [name, version])
  );

  const containerId = `js-ephemeral-${randomUUID()}`;
  const tmpDir = tmp.dirSync({ unsafeCleanup: true });

  try {
    // 1. Start ephemeral container (allow network for npm installs)
    execSync(
      `docker run -d --network host --memory 512m --cpus 1 ` +
        `--workdir /workspace --name ${containerId} ${image} tail -f /dev/null`
    );

    // 2. Prepare workspace files
    await fs.writeFile(path.join(tmpDir.name, "index.js"), code);
    await fs.writeFile(
      path.join(tmpDir.name, "package.json"),
      JSON.stringify(
        { type: "module", dependencies: dependenciesRecord },
        null,
        2
      )
    );

    // 3. Copy files into container
    execSync(`docker cp ${tmpDir.name}/. ${containerId}:/workspace`);

    // 4. Install dependencies and execute
    const installCmd = `npm install --omit=dev --ignore-scripts --no-audit --loglevel=error`;
    const runCmd = `node index.js`;
    const fullCmd = `${installCmd} && ${runCmd}`;

    const output = execSync(
      `docker exec ${containerId} /bin/sh -c ${JSON.stringify(fullCmd)}`,
      { encoding: "utf8" }
    );

    return { content: [textContent(output)] };
  } finally {
    // 5. Cleanup: remove container and temp files
    execSync(`docker rm -f ${containerId}`);
    tmpDir.removeCallback();
  }
}
