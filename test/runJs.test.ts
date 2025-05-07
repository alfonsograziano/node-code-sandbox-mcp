import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as tmp from 'tmp';
import { z } from 'zod';
import runJs, { argSchema } from '../src/tools/runJs.ts';
import initializeSandbox from '../src/tools/initialize.ts';
import stopSandbox from '../src/tools/stop.ts';
import type { McpContentText } from '../src/types.ts';

describe('argSchema', () => {
  it('should accept code and container_id and set defaults', () => {
    const parsed = z.object(argSchema).parse({
      code: "console.log('hi');",
      container_id: 'dummy',
    });
    expect(parsed.container_id).toBe('dummy');
    expect(parsed.dependencies).toEqual([]);
    expect(parsed.code).toBe("console.log('hi');");
  });
});

describe('runJs basic execution', () => {
  let containerId: string;
  let tmpDir: tmp.DirResult;

  beforeEach(async () => {
    tmpDir = tmp.dirSync({ unsafeCleanup: true });
    process.env.FILES_DIR = tmpDir.name;

    const result = await initializeSandbox({});
    if (result.content[0].type === 'text') {
      containerId = result.content[0].text;
    } else {
      throw new Error("Expected the first content item to be of type 'text'");
    }
  });

  afterEach(() => {
    tmpDir.removeCallback();
    delete process.env.FILES_DIR;

    if (containerId) {
      stopSandbox({ container_id: containerId });
    }
  });

  it('should run simple JS in container', async () => {
    const result = await runJs({
      container_id: containerId,
      code: `console.log("Hello from runJs")`,
    });

    expect(result).toBeDefined();
    expect(result.content.length).toBeGreaterThan(0);

    const output = result.content[0];
    expect(output.type).toBe('text');
    if (output.type === 'text') {
      expect(output.text).toContain('Hello from runJs');
    }
  });

  it('should generate telemetry', async () => {
    const result = await runJs({
      container_id: containerId,
      code: "console.log('Hello telemetry!');",
    });

    const telemetryItem = result.content.find(
      (c) => c.type === 'text' && c.text.startsWith('Telemetry:')
    );

    expect(telemetryItem).toBeDefined();
    if (telemetryItem?.type === 'text') {
      const telemetry = JSON.parse(
        telemetryItem.text.replace('Telemetry:\n', '')
      );

      expect(telemetry).toHaveProperty('installTimeMs');
      expect(typeof telemetry.installTimeMs).toBe('number');
      expect(telemetry).toHaveProperty('runTimeMs');
      expect(typeof telemetry.runTimeMs).toBe('number');
      expect(telemetry).toHaveProperty('installOutput');
      expect(typeof telemetry.installOutput).toBe('string');
    } else {
      throw new Error("Expected telemetry item to be of type 'text'");
    }
  });
  it('should write and retrieve a file', async () => {
    const result = await runJs({
      container_id: containerId,
      code: `
        import fs from 'fs/promises';
        await fs.writeFile('./files/hello test.txt', 'Hello world!');
        console.log('Saved hello test.txt');
      `,
    });

    // Assert stdout contains the save confirmation
    const stdoutEntry = result.content.find(
      (c) => c.type === 'text' && c.text.includes('Saved hello test.txt')
    );
    expect(stdoutEntry).toBeDefined();

    // Assert the change list mentions the created file
    const changeList = result.content.find(
      (c) =>
        c.type === 'text' &&
        c.text.includes('List of changed files') &&
        c.text.includes('- hello test.txt was created')
    );
    expect(changeList).toBeDefined();

    // Assert the resource entry has the correct text and URI
    const resourceEntry = result.content.find(
      (c) =>
        c.type === 'resource' &&
        'text' in c.resource &&
        c.resource.text === 'hello test.txt'
    );
    expect(resourceEntry).toBeDefined();
    if (resourceEntry?.type === 'resource') {
      // The URI should include the filename (URL-encoded)
      expect(resourceEntry.resource.uri).toContain('hello%20test.txt');
    }
  });

  it('should skip npm install if no dependencies are provided', async () => {
    const result = await runJs({
      container_id: containerId,
      code: "console.log('No deps');",
      dependencies: [],
    });

    const telemetryItem = result.content.find(
      (c) => c.type === 'text' && c.text.startsWith('Telemetry:')
    );

    expect(telemetryItem).toBeDefined();
    if (telemetryItem?.type === 'text') {
      const telemetry = JSON.parse(
        telemetryItem.text.replace('Telemetry:\n', '')
      );

      expect(telemetry.installTimeMs).toBe(0);
      expect(telemetry.installOutput).toBe(
        'Skipped npm install (no dependencies)'
      );
    }
  });

  it('should install lodash and use it', async () => {
    const result = await runJs({
      container_id: containerId,
      code: `
        import _ from 'lodash';
        console.log(_.join(['Hello', 'lodash'], ' '));
      `,
      dependencies: [{ name: 'lodash', version: '^4.17.21' }],
    });

    const stdout = result.content.find((c) => c.type === 'text');
    expect(stdout).toBeDefined();
    if (stdout?.type === 'text') {
      expect(stdout.text).toContain('Hello lodash');
    }
  });

  it('should hang indefinitely until a timeout error gets triggered', async () => {
    //Simulating a 10 seconds timeout
    process.env.RUN_SCRIPT_TIMEOUT = '10000';
    const result = await runJs({
      container_id: containerId,
      code: `
        (async () => {
          console.log("🕒 Hanging for 20 seconds…");
          await new Promise((resolve) => setTimeout(resolve, 20_000));
          console.log("✅ Done waiting 20 seconds, exiting now.");
        })();
      `,
    });

    //Cleanup
    delete process.env.RUN_SCRIPT_TIMEOUT;

    const execError = result.content.find(
      (item) =>
        item.type === 'text' && item.text.startsWith('Error during execution:')
    );
    expect(execError).toBeDefined();
    expect((execError as McpContentText).text).toContain('ETIMEDOUT');

    const telemetryText = result.content.find(
      (item) => item.type === 'text' && item.text.startsWith('Telemetry:')
    );
    expect(telemetryText).toBeDefined();
  }, 20_000);

  it('should report execution error for runtime exceptions', async () => {
    const result = await runJs({
      container_id: containerId,
      code: `throw new Error('boom');`,
    });

    expect(result).toBeDefined();
    expect(result.content).toBeDefined();

    const execError = result.content.find(
      (item) =>
        item.type === 'text' && item.text.startsWith('Error during execution:')
    );
    expect(execError).toBeDefined();
    expect((execError as McpContentText).text).toContain('Error: boom');

    const telemetryText = result.content.find(
      (item) => item.type === 'text' && item.text.startsWith('Telemetry:')
    );
    expect(telemetryText).toBeDefined();
  });
}, 10_000);
