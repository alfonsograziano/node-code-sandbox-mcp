import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setServerRunId } from '../src/tools/initialize.ts';
import * as childProcess from 'node:child_process';
import * as utils from '../src/utils.ts';

vi.mock('node:child_process');
vi.mock('../src/utils');
vi.mocked(utils).computeResourceLimits = vi
  .fn()
  .mockReturnValue({ memFlag: '', cpuFlag: '' });
vi.mock('../src/runUtils', () => ({
  getFilesDir: vi.fn().mockReturnValue('/mock/files/dir'),
}));
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
    vi.spyOn(childProcess, 'execSync').mockImplementation(() =>
      Buffer.from('')
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('setServerRunId', () => {
    it('should set the server run ID correctly', async () => {
      // Import the module that uses the serverRunId
      const { default: initializeSandbox } = await import(
        '../src/tools/initialize.ts'
      );

      // Set a test server run ID
      const testId = 'test-server-run-id';
      setServerRunId(testId);

      // Call initialize function to create a container
      await initializeSandbox({});

      // Verify that execSync was called with the correct label containing our test ID
      expect(childProcess.execSync).toHaveBeenCalled();
      const execSyncCall = vi.mocked(childProcess.execSync).mock
        .calls[0][0] as string;

      expect(execSyncCall).toContain(`--label "mcp-server-run-id=${testId}"`);
    });

    it('should use unknown as the default server run ID if not set', async () => {
      // Force re-import of the module to reset the serverRunId
      vi.resetModules();
      const { default: initializeSandbox } = await import(
        '../src/tools/initialize.ts'
      );

      // Call initialize without setting the server run ID
      await initializeSandbox({});

      // Verify that execSync was called with the default "unknown" ID
      expect(childProcess.execSync).toHaveBeenCalled();
      const execSyncCall = vi.mocked(childProcess.execSync).mock
        .calls[0][0] as string;

      expect(execSyncCall).toContain('--label "mcp-server-run-id=unknown"');
    });
  });
});
