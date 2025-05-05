import { forceStopContainer as dockerForceStopContainer } from './dockerUtils.js';

// Registry for active sandbox containers: Map<containerId, creationTimestamp>
export const activeSandboxContainers = new Map<string, number>();

/**
 * Starts the periodic scavenger task to clean up timed-out containers.
 * @param containerTimeoutMilliseconds The maximum allowed age for a container in milliseconds.
 * @param containerTimeoutSeconds The timeout in seconds (for logging).
 * @param checkIntervalMilliseconds How often the scavenger should check (defaults to 60000ms).
 * @returns The interval handle returned by setInterval.
 */
export function startScavenger(
  containerTimeoutMilliseconds: number,
  containerTimeoutSeconds: number,
  checkIntervalMilliseconds = 60 * 1000
): NodeJS.Timeout {
  console.log(
    `Starting container scavenger. Timeout: ${containerTimeoutSeconds}s, Check Interval: ${checkIntervalMilliseconds / 1000}s`
  );

  const scavengerInterval = setInterval(() => {
    const now = Date.now();
    if (activeSandboxContainers.size > 0) {
      console.log(
        `[Scavenger] Checking ${activeSandboxContainers.size} active containers for timeout (${containerTimeoutSeconds}s)...`
      );
    }
    for (const [
      containerId,
      creationTimestamp,
    ] of activeSandboxContainers.entries()) {
      if (now - creationTimestamp > containerTimeoutMilliseconds) {
        console.warn(
          `[Scavenger] Container ${containerId} timed out (created at ${new Date(creationTimestamp).toISOString()}). Forcing removal.`
        );

        dockerForceStopContainer(containerId)
          .then(() => {
            // Remove from registry AFTER docker command attempt
            activeSandboxContainers.delete(containerId);
            console.log(
              `[Scavenger] Removed container ${containerId} from registry.`
            );
          })
          .catch((error) => {
            // Log error from force stop attempt but continue scavenger
            console.error(
              `[Scavenger] Error during forced stop of ${containerId}:`,
              error
            );
            // Still attempt to remove from registry if Docker failed
            activeSandboxContainers.delete(containerId);
            console.log(
              `[Scavenger] Removed container ${containerId} from registry after error.`
            );
          });
      }
    }
  }, checkIntervalMilliseconds);

  return scavengerInterval;
}
