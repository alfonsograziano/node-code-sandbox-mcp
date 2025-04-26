import { z } from "zod";
import { execSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import tmp from "tmp";
import { randomUUID } from "node:crypto";
import { McpResponse, textContent } from "../types";

export const argSchema = {
  image: z.string().optional(),
  code: z.string(),
  dependencies: z.record(z.string(), z.string()).optional().default({}),
};

export default async function runJsEphemeral({
  image = "node:20-slim",
  code,
  dependencies,
}: {
  image?: string;
  code: string;
  dependencies?: Record<string, string>;
}): Promise<McpResponse> {
  const containerId = `js-ephemeral-${randomUUID()}`;
  const tmpDir = tmp.dirSync({ unsafeCleanup: true });

  try {
    // 1. Start ephemeral container
    execSync(
      `docker run -d --network none --memory 512m --cpus 1 ` +
        `--workdir /workspace --name ${containerId} ${image} tail -f /dev/null`
    );

    // 2. Prepare workspace files
    await fs.writeFile(path.join(tmpDir.name, "index.js"), code);
    await fs.writeFile(
      path.join(tmpDir.name, "package.json"),
      JSON.stringify({ type: "module", dependencies }, null, 2)
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
