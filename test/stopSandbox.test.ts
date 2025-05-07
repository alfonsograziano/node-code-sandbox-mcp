import { describe, it, expect, vi, beforeEach } from 'vitest';
import stopSandbox from '../src/tools/stop.ts';
import * as childProcess from 'node:child_process';
import * as types from '../src/types.ts';
import * as utils from '../src/utils.ts';

vi.mock('node:child_process');
vi.mock('../src/types');
vi.mock('../src/utils');

describe('stopSandbox', () => {
  const fakeContainerId = 'js-sbx-abc123';

  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(childProcess, 'execSync').mockImplementation(() =>
      Buffer.from('')
    );
    vi.spyOn(types, 'textContent').mockImplementation((msg) => ({
      type: 'text',
      text: msg,
    }));
    vi.spyOn(utils, 'isDockerRunning').mockReturnValue(true);
  });

  it('should remove the container with the given ID', async () => {
    const result = await stopSandbox({ container_id: fakeContainerId });

    expect(childProcess.execSync).toHaveBeenCalledWith(
      `docker rm -f ${fakeContainerId}`
    );

    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: `Container ${fakeContainerId} removed.`,
        },
      ],
    });
  });

  it('should return an error message when Docker is not running', async () => {
    vi.mocked(utils.isDockerRunning).mockReturnValue(false);

    const result = await stopSandbox({ container_id: fakeContainerId });

    // Docker command should not be called
    expect(childProcess.execSync).not.toHaveBeenCalled();

    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: utils.DOCKER_NOT_RUNNING_ERROR,
        },
      ],
    });
  });

  it('should handle errors when removing the container', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const errorMessage = 'Container not found';
    vi.mocked(childProcess.execSync).mockImplementation(() => {
      throw new Error(errorMessage);
    });

    // Even with errors, the function should complete and return a response
    const result = await stopSandbox({ container_id: fakeContainerId });

    expect(childProcess.execSync).toHaveBeenCalledWith(
      `docker rm -f ${fakeContainerId}`
    );

    // Function should return an error message in the response
    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: `Error removing container ${fakeContainerId}: ${errorMessage}`,
        },
      ],
    });
  });
});
