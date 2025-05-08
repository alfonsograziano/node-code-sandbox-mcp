import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Mock } from 'vitest';
import { z } from 'zod';
import getDependencyTypes, {
  argSchema,
} from '../src/tools/getDependencyTypes.ts';
import type { McpContentText } from '../src/types.ts';

// Schema validation tests
describe('argSchema', () => {
  it('should accept valid dependencies array with version', () => {
    const input = { dependencies: [{ name: 'foo', version: '1.2.3' }] };
    const parsed = z.object(argSchema).parse(input);
    expect(parsed).toEqual(input);
  });

  it('should accept valid dependencies array without version', () => {
    const input = { dependencies: [{ name: 'bar' }] };
    const parsed = z.object(argSchema).parse(input);
    expect(parsed).toEqual({
      dependencies: [{ name: 'bar', version: undefined }],
    });
  });

  it('should reject when dependencies is missing', () => {
    expect(() => z.object(argSchema).parse({} as any)).toThrow();
  });
});

// Tool behavior tests
describe('getDependencyTypes', () => {
  beforeEach(() => {
    // Stub global.fetch
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should return in-package types when available', async () => {
    // Mock registry metadata fetch
    (fetch as Mock).mockImplementation((url: string) => {
      if (url === 'https://registry.npmjs.org/foo') {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            'dist-tags': { latest: '1.0.0' },
            versions: { '1.0.0': { types: 'index.d.ts' } },
          }),
        });
      }
      if (url === 'https://unpkg.com/foo@1.0.0/index.d.ts') {
        return Promise.resolve({
          ok: true,
          text: async () => '/* foo types */',
        });
      }
      return Promise.resolve({ ok: false });
    });

    const response = await getDependencyTypes({
      dependencies: [{ name: 'foo' }],
    });
    // Verify structure
    expect(response.content).toHaveLength(1);
    const item = response.content[0] as McpContentText;
    expect(item.type).toBe('text');

    const parsed = JSON.parse(item.text) as any[];
    expect(parsed).toEqual([
      {
        name: 'foo',
        hasTypes: true,
        types: '/* foo types */',
        version: '1.0.0',
      },
    ]);
  });

  it('should fallback to @types package when in-package types are missing', async () => {
    (fetch as Mock).mockImplementation((url: string) => {
      if (url === 'https://registry.npmjs.org/bar') {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            'dist-tags': { latest: '2.0.0' },
            versions: { '2.0.0': {} },
          }),
        });
      }
      if (url === 'https://registry.npmjs.org/%40types%2Fbar') {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            'dist-tags': { latest: '3.1.4' },
            versions: { '3.1.4': { typings: 'index.d.ts' } },
          }),
        });
      }
      if (url === 'https://unpkg.com/@types/bar@3.1.4/index.d.ts') {
        return Promise.resolve({
          ok: true,
          text: async () => '/* bar external types */',
        });
      }
      return Promise.resolve({ ok: false });
    });

    const response = await getDependencyTypes({
      dependencies: [{ name: 'bar' }],
    });
    expect(response.content).toHaveLength(1);
    const item = response.content[0] as McpContentText;
    expect(item.type).toBe('text');

    const parsed = JSON.parse(item.text) as any[];
    expect(parsed).toEqual([
      {
        name: 'bar',
        hasTypes: true,
        types: '/* bar external types */',
        typesPackage: '@types/bar',
        version: '3.1.4',
      },
    ]);
  });

  it('should return hasTypes false when no types are available', async () => {
    (fetch as Mock).mockImplementation((url: string) => {
      if (url.startsWith('https://registry.npmjs.org/')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            'dist-tags': { latest: '0.1.0' },
            versions: { '0.1.0': {} },
          }),
        });
      }
      // @types lookup fails
      return Promise.resolve({ ok: false });
    });

    const response = await getDependencyTypes({
      dependencies: [{ name: 'baz' }],
    });
    const item = response.content[0] as McpContentText;

    const parsed = JSON.parse(item.text) as any[];
    expect(parsed).toEqual([{ name: 'baz', hasTypes: false }]);
  });

  it('should handle fetch errors gracefully', async () => {
    (fetch as Mock).mockImplementation(() => {
      throw new Error('Network failure');
    });

    const response = await getDependencyTypes({
      dependencies: [{ name: 'qux' }],
    });
    const item = response.content[0] as McpContentText;

    const parsed = JSON.parse(item.text) as any[];
    expect(parsed).toEqual([{ name: 'qux', hasTypes: false }]);
  });
});

describe('getDependencyTypes integration test', () => {
  it('should fetch real types for dayjs', async () => {
    // Restore real fetch to allow network requests
    vi.restoreAllMocks();

    const response = await getDependencyTypes({
      dependencies: [{ name: 'dayjs', version: '1.11.7' }],
    });

    expect(response.content).toHaveLength(1);
    const item = response.content[0] as McpContentText;
    expect(item.type).toBe('text');

    const parsed = JSON.parse(item.text) as any[];

    expect(parsed[0].name).toBe('dayjs');
    expect(parsed[0].hasTypes).toBe(true);
    expect(parsed[0].types).toBeDefined();
    expect(parsed[0].types.length).toBeGreaterThan(0);
    expect(parsed[0].version).toBe('1.11.7');
  }, 15_000);

  it('should fetch external types from @types for express', async () => {
    // Restore real fetch to allow network requests
    vi.restoreAllMocks();

    const response = await getDependencyTypes({
      dependencies: [{ name: 'express', version: '4.17.1' }],
    });

    expect(response.content).toHaveLength(1);
    const item = response.content[0] as McpContentText;
    expect(item.type).toBe('text');

    const parsed = JSON.parse(item.text) as any[];

    expect(parsed[0].name).toBe('express');
    expect(parsed[0].hasTypes).toBe(true);
    expect(parsed[0].typesPackage).toBe('@types/express');
    expect(parsed[0].types).toBeDefined();
    expect(parsed[0].types.length).toBeGreaterThan(0);
    expect(typeof parsed[0].version).toBe('string');
  }, 15_000);
});
