import { describe, it, expect } from 'vitest';
import initializeSandbox from '../src/tools/initialize.ts';
import stopSandbox from '../src/tools/stop.ts';
import execInSandbox from '../src/tools/exec.ts';
import { containerExists, isContainerRunning } from './utils.ts';

describe('sandbox full lifecycle', () => {
  it('should create, exec in, and remove a Docker sandbox container', async () => {
    // Step 1: Start container
    const start = await initializeSandbox({});
    const content = start.content[0];
    if (content.type !== 'text') throw new Error('Unexpected content type');
    const containerId = content.text;

    expect(containerId).toMatch(/^js-sbx-/);
    expect(isContainerRunning(containerId)).toBe(true);

    // Step 2: Execute command
    const execResult = await execInSandbox({
      container_id: containerId,
      commands: ['echo Hello World', 'uname -a'],
    });

    const execOutput = execResult.content[0];
    if (execOutput.type !== 'text') throw new Error('Unexpected content type');

    expect(execOutput.text).toContain('Hello World');
    expect(execOutput.text).toMatch(/Linux|Unix/); // should match OS output

    // Step 3: Stop container
    const stop = await stopSandbox({ container_id: containerId });
    const stopMsg = stop.content[0];
    if (stopMsg.type !== 'text') throw new Error('Unexpected content type');

    expect(stopMsg.text).toContain(`Container ${containerId} removed.`);
    expect(containerExists(containerId)).toBe(false);
  });
});
