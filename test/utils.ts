import { execSync } from "node:child_process";

/**
 * Utility to check if a Docker container is running
 */
export function isContainerRunning(containerId: string): boolean {
  try {
    const output = execSync(
      `docker inspect -f '{{.State.Running}}' ${containerId}`
    )
      .toString()
      .trim();
    return output === "true";
  } catch {
    return false;
  }
}

/**
 * Utility to check if a Docker container exists
 */
export function containerExists(containerId: string): boolean {
  try {
    execSync(`docker inspect ${containerId}`);
    return true;
  } catch {
    return false;
  }
}
