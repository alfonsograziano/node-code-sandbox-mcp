import { describe, it, expect, vi, beforeEach } from 'vitest';
import initializeSandbox from '../src/tools/initialize.ts';
import * as childProcess from 'node:child_process';
import * as crypto from 'node:crypto';
import * as utils from '../src/utils.ts';
import * as types from '../src/types.ts';

vi.mock('node:child_process');
vi.mock('node:crypto');
vi.mock('../types');

describe('initializeSandbox', () => {
  const fakeUUID = '123e4567-e89b-12d3-a456-426614174000';
  const fakeContainerName = `js-sbx-${fakeUUID}`;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(fakeUUID);
    vi.spyOn(childProcess, 'execSync').mockImplementation(() =>
      Buffer.from('')
    );
    vi.spyOn(types, 'textContent').mockImplementation((name) => ({
      type: 'text',
      text: name,
    }));
  });

  it('should return an error message if Docker is not running', async () => {
    vi.spyOn(utils, 'isDockerRunning').mockReturnValue(false);
    const result = await initializeSandbox({});
    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: 'Error: Docker is not running. Please start Docker and try again.',
        },
      ],
    });
  });

  it('should use the default image when none is provided', async () => {
    const result = await initializeSandbox({});
    expect(childProcess.execSync).toHaveBeenCalledWith(
      expect.stringContaining(
        `--name ${fakeContainerName} ${utils.DEFAULT_NODE_IMAGE}`
      )
    );
    expect(result).toEqual({
      content: [{ type: 'text', text: fakeContainerName }],
    });
  });

  it('should use the provided image', async () => {
    const customImage = 'node:20-alpine';
    const result = await initializeSandbox({ image: customImage });
    expect(childProcess.execSync).toHaveBeenCalledWith(
      expect.stringContaining(`--name ${fakeContainerName} ${customImage}`)
    );
    if (result.content[0].type === 'text') {
      expect(result.content[0].text).toBe(fakeContainerName);
    } else {
      throw new Error('Unexpected content type');
    }
  });
});
