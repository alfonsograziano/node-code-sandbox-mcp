import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

/**
 * Attempts to forcefully stop and remove a Docker container by its ID.
 * Logs errors but does not throw them to allow cleanup flows to continue.
 * Does NOT manage any external container registry/map.
 * @param containerId The ID of the container to stop and remove.
 */
export async function forceStopContainer(containerId: string): Promise<void> {
  // console.log(
  //   `Attempting to stop and remove container via dockerUtils: ${containerId}`
  // );
  try {
    // Force stop the container (ignores errors if already stopped)
    await execPromise(`docker stop ${containerId} || true`);
    // Force remove the container (ignores errors if already removed)
    await execPromise(`docker rm -f ${containerId} || true`);
    // console.log(
    //   `Successfully issued stop/remove commands for container: ${containerId}`
    // );
  } catch (error) {
    // Log errors but don't throw
    // console.error(
    //   `Error during docker stop/remove commands for container ${containerId}:`,
    //   typeof error === 'object' &&
    //     error !== null &&
    //     ('stderr' in error || 'message' in error)
    //     ? (error as { stderr?: string; message?: string }).stderr ||
    //         (error as { message: string }).message
    //     : String(error)
    // );
  }
}
