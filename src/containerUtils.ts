import { forceStopContainer as dockerForceStopContainer } from './dockerUtils.ts';
import { logger } from './logger.ts';

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
  logger.info(
    `Starting container scavenger. Timeout: ${containerTimeoutSeconds}s, Check Interval: ${checkIntervalMilliseconds / 1000}s`
  );

  const scavengerInterval = setInterval(() => {
    const now = Date.now();
    if (activeSandboxContainers.size > 0) {
      logger.debug(
        `Checking ${activeSandboxContainers.size} active containers for timeout (${containerTimeoutSeconds}s)...`
      );
    }
    for (const [
      containerId,
      creationTimestamp,
    ] of activeSandboxContainers.entries()) {
      if (now - creationTimestamp > containerTimeoutMilliseconds) {
        logger.warning(
          `Container ${containerId} timed out (created at ${new Date(creationTimestamp).toISOString()}). Forcing removal.`
        );

        dockerForceStopContainer(containerId)
          .then(() => {
            // Remove from registry AFTER docker command attempt
            activeSandboxContainers.delete(containerId);
            logger.info(`Removed container ${containerId} from registry.`);
          })
          .catch((error) => {
            // Log error from force stop attempt but continue scavenger
            logger.error(`Error during forced stop of ${containerId}`, error);
            // Still attempt to remove from registry if Docker failed
            activeSandboxContainers.delete(containerId);
            logger.info(
              `Removed container ${containerId} from registry after error.`
            );
          });
      }
    }
  }, checkIntervalMilliseconds);

  return scavengerInterval;
}

/**
 * Attempts to stop and remove all containers currently listed in the
 * activeSandboxContainers registry.
 * Should be called during graceful shutdown.
 */
export async function cleanActiveContainers(): Promise<void> {
  const containersToClean = Array.from(activeSandboxContainers.keys());

  if (containersToClean.length === 0) {
    logger.info('[Shutdown Cleanup] No active containers to clean up.');
    return;
  }

  logger.info(
    `[Shutdown Cleanup] Cleaning up ${containersToClean.length} active containers...`
  );

  const cleanupPromises = containersToClean.map(async (id) => {
    try {
      await dockerForceStopContainer(id); // Attempt to stop/remove via Docker
    } catch (error) {
      // Log error but continue, registry removal happens regardless
      logger.error(`[Shutdown Cleanup] Error stopping container ${id}`, error);
    } finally {
      activeSandboxContainers.delete(id); // Always remove from registry
      logger.info(`[Shutdown Cleanup] Removed container ${id} from registry.`);
    }
  });

  const results = await Promise.allSettled(cleanupPromises);
  logger.info('[Shutdown Cleanup] Container cleanup finished.');

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      logger.error(
        `[Shutdown Cleanup] Promise for container ${containersToClean[index]} rejected`,
        result.reason
      );
    }
  });
}
