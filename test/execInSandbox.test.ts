import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from 'vitest';
import initializeSandbox from '../src/tools/initialize.ts';
import execInSandbox from '../src/tools/exec.ts';
import stopSandbox from '../src/tools/stop.ts';
import * as utils from '../src/utils.ts';
import { vi } from 'vitest';

let containerId: string;

beforeAll(async () => {
  const result = await initializeSandbox({});
  const content = result.content[0];
  if (content.type !== 'text') throw new Error('Unexpected content type');
  containerId = content.text;
});

afterAll(async () => {
  await stopSandbox({ container_id: containerId });
});

describe('execInSandbox', () => {
  it('should return an error if Docker is not running', async () => {
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

    vi.restoreAllMocks();
  });
  it('should execute a single command and return its output', async () => {
    const result = await execInSandbox({
      container_id: containerId,
      commands: ['echo Hello'],
    });

    expect(result.content[0].type).toBe('text');
    if (result.content[0].type === 'text') {
      expect(result.content[0].text.trim()).toBe('Hello');
    } else {
      throw new Error('Unexpected content type');
    }
  });

  it('should execute multiple commands and join their outputs', async () => {
    const result = await execInSandbox({
      container_id: containerId,
      commands: ['echo First', 'echo Second'],
    });

    let output: string[] = [];
    if (result.content[0].type === 'text') {
      output = result.content[0].text.trim().split('\n');
      expect(output).toEqual(['First', '', 'Second']);
    } else {
      throw new Error('Unexpected content type');
    }
  });

  it('should handle command with special characters', async () => {
    const result = await execInSandbox({
      container_id: containerId,
      commands: ['echo "Special: $HOME"'],
    });

    if (result.content[0].type === 'text') {
      expect(result.content[0].text.trim()).toContain('Special:');
    } else {
      throw new Error('Unexpected content type');
    }
  });
});

describe('Command injection prevention', () => {
  beforeEach(() => {
    vi.doMock('node:child_process', () => ({
      execFileSync: vi.fn(() => Buffer.from('')),
      execFile: vi.fn(() => Buffer.from('')),
    }));
  });

  afterEach(() => {
    vi.resetModules();
    vi.resetAllMocks();
    vi.restoreAllMocks();
  });

  const dangerousIds = [
    '$(touch /tmp/pwned)',
    '`touch /tmp/pwned`',
    'bad;id',
    'js-sbx-123 && rm -rf /',
    'js-sbx-123 | echo hacked',
    'js-sbx-123 > /tmp/pwned',
    'js-sbx-123 $(id)',
    'js-sbx-123; echo pwned',
    'js-sbx-123`echo pwned`',
    'js-sbx-123/../../etc/passwd',
    'js-sbx-123\nrm -rf /',
    '',
    ' ',
    'js-sbx-123$',
    'js-sbx-123#',
  ];

  dangerousIds.forEach((payload) => {
    it(`should reject dangerous container_id: "${payload}"`, async () => {
      const { default: execInSandbox } = await import('../src/tools/exec.ts');
      const childProcess = await import('node:child_process');
      const result = await execInSandbox({
        container_id: payload,
        commands: ['echo test'],
      });
      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: 'Invalid container ID',
          },
        ],
      });
      const execFileSyncCall = vi.mocked(childProcess.execFileSync).mock.calls;
      expect(execFileSyncCall.length).toBe(0);
    });
  });
});
