import { z } from "zod";
import { execSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import tmp from "tmp";
import { McpResponse, textContent } from "../types";

export const argSchema = {
  container_id: z.string(),
  code: z.string(),
  dependencies: z
    .record(z.string().regex(/^[~^]?\d+/))
    .optional()
    .default({}),
};

export default async function runJs({
  container_id,
  code,
  dependencies,
}: {
  container_id: string;
  code: string;
  dependencies?: Record<string, string>;
}): Promise<McpResponse> {
  // 1.  create a temp dir inside container workdir
  const dirName = `job-${Date.now()}`;
  execSync(`docker exec ${container_id} mkdir -p /workspace/${dirName}`);
  // 2.  prepare local tmp build ctx
  const localTmp = tmp.dirSync({ unsafeCleanup: true });
  await fs.writeFile(path.join(localTmp.name, "index.js"), code);
  await fs.writeFile(
    path.join(localTmp.name, "package.json"),
    JSON.stringify({ type: "module", dependencies }, null, 2)
  );
  // 3.  copy into container
  execSync(
    `docker cp ${localTmp.name}/. ${container_id}:/workspace/${dirName}`
  );
  // 4.  install deps & run
  const installCmd = `cd /workspace/${dirName} && npm install --omit=dev --ignore-scripts --no-audit --loglevel=error`;
  const runCmd = `node /workspace/${dirName}/index.js`;
  const full = `${installCmd} && ${runCmd}`;
  const result = execSync(
    `docker exec ${container_id} /bin/sh -c ${JSON.stringify(full)}`,
    {
      encoding: "utf8",
    }
  );
  // 5.  clean up files (optional)
  execSync(`docker exec ${container_id} rm -rf /workspace/${dirName}`);
  localTmp.removeCallback();
  return { content: [textContent(result)] };
}
