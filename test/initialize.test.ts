import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as childProcess from 'node:child_process';
import * as utils from '../src/utils.ts';

vi.mock('node:child_process', () => ({
  execFileSync: vi.fn(() => Buffer.from('')),
}));
vi.mock('../src/utils');
vi.mocked(utils).computeResourceLimits = vi
  .fn()
  .mockReturnValue({ memFlag: '', cpuFlag: '' });

vi.mock('../src/containerUtils', () => ({
  activeSandboxContainers: new Map(),
}));

describe('initialize module', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(utils, 'isDockerRunning').mockReturnValue(true);
    vi.spyOn(utils, 'computeResourceLimits').mockReturnValue({
      memFlag: '',
      cpuFlag: '',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('setServerRunId', () => {
    it('should set the server run ID correctly', async () => {
      vi.doMock('../src/runUtils', () => ({
        getFilesDir: vi.fn().mockReturnValue(''),
        getMountFlag: vi.fn().mockReturnValue(''),
      }));
      vi.resetModules();
      const mod = await import('../src/tools/initialize.ts');
      const initializeSandbox = mod.default;
      const setServerRunId = mod.setServerRunId;

      // Set a test server run ID
      const testId = 'test-server-run-id';
      setServerRunId(testId);

      // Call initialize function to create a container
      await initializeSandbox({});

      // Verify that execFileSync was called with the correct label containing our test ID
      expect(childProcess.execFileSync).toHaveBeenCalled();
      const execFileSyncCall = vi.mocked(childProcess.execFileSync).mock
        .calls[0][1] as string[];
      // Join the args array to a string for easier matching
      expect(execFileSyncCall.join(' ')).toContain(
        `--label mcp-server-run-id=${testId}`
      );
    });

    it('should use unknown as the default server run ID if not set', async () => {
      vi.doMock('../src/runUtils', () => ({
        getFilesDir: vi.fn().mockReturnValue(''),
        getMountFlag: vi.fn().mockReturnValue(''),
      }));
      vi.resetModules();
      const { default: initializeSandbox } = await import(
        '../src/tools/initialize.ts'
      );

      // Call initialize without setting the server run ID
      await initializeSandbox({});

      // Verify that execFileSync was called with the default "unknown" ID
      expect(childProcess.execFileSync).toHaveBeenCalled();
      const execFileSyncCall = vi.mocked(childProcess.execFileSync).mock
        .calls[0][1] as string[];
      expect(execFileSyncCall.join(' ')).toContain(
        '--label mcp-server-run-id=unknown'
      );
    });
  });

  describe('volume mount behaviour', () => {
    it('does NOT include a -v flag when FILES_DIR is unset', async () => {
      vi.doMock('../src/runUtils', () => ({
        getFilesDir: vi.fn().mockReturnValue(''),
        getMountFlag: vi.fn().mockReturnValue(''),
      }));
      vi.resetModules();
      const { default: initializeSandbox } = await import(
        '../src/tools/initialize.ts'
      );

      await initializeSandbox({});

      const args = vi.mocked(childProcess.execFileSync).mock
        .calls[0][1] as string[];
      expect(args.join(' ')).not.toContain('-v ');
    });

    it('includes the -v flag when getMountFlag returns one', async () => {
      vi.doMock('../src/runUtils', () => ({
        getFilesDir: vi.fn().mockReturnValue('/host/dir'),
        getMountFlag: vi.fn().mockReturnValue('-v /host/dir:/workspace/files'),
      }));
      vi.resetModules();
      const { default: initializeSandbox } = await import(
        '../src/tools/initialize.ts'
      );

      await initializeSandbox({});

      const args = vi.mocked(childProcess.execFileSync).mock
        .calls[0][1] as string[];
      expect(args.join(' ')).toContain('-v /host/dir:/workspace/files');
    });
  });
});
