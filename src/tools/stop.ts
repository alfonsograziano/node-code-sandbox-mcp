import { z } from "zod";
import { execSync } from "node:child_process";
import { McpResponse, textContent } from "../types.js";

export const argSchema = { container_id: z.string() };

export default async function stopSandbox({
  container_id,
}: {
  container_id: string;
}): Promise<McpResponse> {
  execSync(`docker rm -f ${container_id}`);
  return {
    content: [textContent(`Container ${container_id} removed.`)],
  };
}
