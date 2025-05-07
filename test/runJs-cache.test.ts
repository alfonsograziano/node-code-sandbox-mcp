import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as tmp from 'tmp';
import { execSync } from 'node:child_process';
import runJs from '../src/tools/runJs.ts';
import { DEFAULT_NODE_IMAGE } from '../src/utils.ts';

function startSandboxContainer(): string {
  return execSync(
    `docker run -d --network host --memory 512m --cpus 1 --workdir /workspace ${DEFAULT_NODE_IMAGE} tail -f /dev/null`,
    { encoding: 'utf-8' }
  ).trim();
}
let tmpDir: tmp.DirResult;

function stopSandboxContainer(containerId: string) {
  execSync(`docker rm -f ${containerId}`);
}

describe('runJs npm install benchmarking', () => {
  beforeEach(() => {
    tmpDir = tmp.dirSync({ unsafeCleanup: true });
    process.env.FILES_DIR = tmpDir.name;
  });

  afterEach(() => {
    tmpDir.removeCallback();
    delete process.env.FILES_DIR;
  });

  it('should install dependency faster on second run due to caching', async () => {
    const containerId = startSandboxContainer();

    try {
      const dependency = { name: 'lodash', version: '^4.17.21' };

      // First run: benchmark install
      const result1 = await runJs({
        container_id: containerId,
        code: "console.log('Hello')",
        dependencies: [dependency],
      });

      const telemetryItem1 = result1.content.find(
        (c) => c.type === 'text' && c.text.startsWith('Telemetry:')
      );
      expect(telemetryItem1).toBeDefined();
      const telemetry1 = JSON.parse(
        (telemetryItem1 && telemetryItem1.type === 'text'
          ? telemetryItem1.text
          : ''
        ).replace('Telemetry:\n', '')
      );
      const installTimeMs1 = telemetry1.installTimeMs;

      // Second run: same install again, expect faster
      const result2 = await runJs({
        container_id: containerId,
        code: "console.log('Hello')",
        dependencies: [dependency],
      });

      const telemetryItem2 = result2.content.find(
        (c) => c.type === 'text' && c.text.startsWith('Telemetry:')
      );
      expect(telemetryItem2).toBeDefined();
      const telemetry2 = JSON.parse(
        (telemetryItem2 && telemetryItem2.type === 'text'
          ? telemetryItem2.text
          : ''
        ).replace('Telemetry:\n', '')
      );
      const installTimeMs2 = telemetry2.installTimeMs;
      // Assert that second install is faster
      try {
        expect(installTimeMs2).toBeLessThan(installTimeMs1);
      } catch (error) {
        console.error('Error in assertion:', error);
        console.log(`First install time: ${installTimeMs1}ms`);
        console.log(`Second install time: ${installTimeMs2}ms`);
        throw error; // Re-throw the error to fail the test
      }
    } finally {
      stopSandboxContainer(containerId);
    }
  }, 20_000);
});
