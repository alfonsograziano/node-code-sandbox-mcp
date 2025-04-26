import { z } from "zod";
import { execSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { McpResponse, textContent } from "../types";

export const argSchema = { image: z.string().optional() };

const DEFAULT_IMAGE = "node:20-slim";

export default async function initializeSandbox({
  image = DEFAULT_IMAGE,
}: {
  image?: string;
}): Promise<McpResponse> {
  const container = `js-sbx-${randomUUID()}`;
  execSync(
    `docker run -d --network none --memory 512m --cpus 1 ` +
      `--workdir /workspace --name ${container} ${image} tail -f /dev/null`
  );
  return {
    content: [textContent(container)],
  };
}
