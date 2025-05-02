import { z } from "zod";
import { execSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { McpResponse, textContent } from "../types.js";
import {
  DEFAULT_NODE_IMAGE,
  DOCKER_NOT_RUNNING_ERROR,
  isDockerRunning,
} from "../utils.js";

export const argSchema = {
  image: z.string().optional(),
  port: z
    .number()
    .optional()
    .describe("If set, maps this container port to the host"),
};

export default async function initializeSandbox({
  image = DEFAULT_NODE_IMAGE,
  port,
}: {
  image?: string;
  port?: number;
}): Promise<McpResponse> {
  if (!isDockerRunning()) {
    return {
      content: [textContent(DOCKER_NOT_RUNNING_ERROR)],
    };
  }

  const container = `js-sbx-${randomUUID()}`;

  const portOption = port ? `-p ${port}:${port}` : `--network host`; // prefer --network host if no explicit port mapping

  execSync(
    `docker run -d ${portOption} --memory 512m --cpus 1 ` +
      `--workdir /workspace --name ${container} ${image} tail -f /dev/null`
  );
  return {
    content: [textContent(container)],
  };
}
