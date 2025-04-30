import { z } from "zod";
import { execSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { McpResponse, textContent } from "../types.js";
import { DEFAULT_NODE_IMAGE } from "../utils.js";

export const argSchema = { image: z.string().optional() };

export default async function initializeSandbox({
  image = DEFAULT_NODE_IMAGE,
}: {
  image?: string;
}): Promise<McpResponse> {
  const container = `js-sbx-${randomUUID()}`;
  execSync(
    `docker run -d --network host --memory 512m --cpus 1 ` +
      `--workdir /workspace --name ${container} ${image} tail -f /dev/null`
  );
  return {
    content: [textContent(container)],
  };
}
