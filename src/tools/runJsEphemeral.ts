import { z } from "zod";
import { execSync } from "child_process";
import fs from "fs/promises";
import path from "path";
import tmp from "tmp";
import { randomUUID } from "crypto";
import mime from "mime-types";
import { McpResponse, textContent, McpContent } from "../types.js";
import { pathToFileURL } from "url";
import { isRunningInDocker } from "../utils.js";

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
    // Start an ephemeral container (allow network for npm installs)
    execSync(
      `docker run -d --network host --memory 512m --cpus 1 ` +
        `--workdir /workspace --name ${containerId} ${image} tail -f /dev/null`
    );

    // Prepare workspace files
    await fs.writeFile(path.join(tmpDir.name, "index.js"), code);
    await fs.writeFile(
      path.join(tmpDir.name, "package.json"),
      JSON.stringify(
        { type: "module", dependencies: dependenciesRecord },
        null,
        2
      )
    );

    // Copy files into container
    execSync(`docker cp ${tmpDir.name}/. ${containerId}:/workspace`);

    // 4. Install dependencies and execute
    const installCmd = `npm install --omit=dev --ignore-scripts --no-audit --loglevel=error`;
    const runCmd = `node index.js`;
    const fullCmd = `${installCmd} && ${runCmd}`;

    const rawOutput = execSync(
      `docker exec ${containerId} /bin/sh -c ${JSON.stringify(fullCmd)}`,
      { encoding: "utf8" }
    );

    // Copy everything back out of the container
    execSync(`docker cp ${containerId}:/workspace/. ${tmpDir.name}`);

    // Build the MCP response
    const contents: McpContent[] = [];

    //  Always include stdout, with the requested prefix
    contents.push(textContent(`Node.js process output:\n${rawOutput}`));

    // Determine where to save output files (within the container)

    const isContainer = isRunningInDocker();

    const outputDir = isContainer
      ? path.resolve(process.env.HOME || process.cwd())
      : path.resolve(
          process.env.JS_SANDBOX_OUTPUT_DIR || process.env.HOME || process.cwd()
        );
    await fs.mkdir(outputDir, { recursive: true });

    const imageTypes = new Set(["image/jpeg", "image/png"]);
    const dirents = await fs.readdir(tmpDir.name, { withFileTypes: true });
    for (const dirent of dirents) {
      if (!dirent.isFile()) continue;
      const fname = dirent.name;
      if (
        fname === "index.js" ||
        fname === "package.json" ||
        fname === "package-lock.json"
      )
        continue;
      const fullPath = path.join(tmpDir.name, fname);
      const destPath = path.join(outputDir, fname);

      const jsOutputHost =
        process.env.JS_SANDBOX_OUTPUT_DIR || process.env.HOME || process.cwd();
      const hostPath = path.join(jsOutputHost, fname);

      // Save the file to the output directory
      await fs.copyFile(fullPath, destPath);
      contents.push(textContent(`I saved the file ${fname} at ${hostPath}`));

      const mimeType = mime.lookup(fname) || "application/octet-stream";

      if (imageTypes.has(mimeType)) {
        const b64 = await fs.readFile(fullPath, { encoding: "base64" });
        contents.push({
          type: "image",
          data: b64,
          mimeType,
        });
      }

      // Add a resource item pointing at the saved file
      contents.push({
        type: "resource",
        resource: {
          uri: pathToFileURL(hostPath).href,
          mimeType,
          text: fname,
        },
      });
    }

    return { content: contents };
  } finally {
    execSync(`docker rm -f ${containerId}`);
    tmpDir.removeCallback();
  }
}
