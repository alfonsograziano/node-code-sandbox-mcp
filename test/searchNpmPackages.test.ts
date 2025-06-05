import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type Mock,
} from 'vitest';
import searchNpmPackages from '../src/tools/searchNpmPackages.ts';
import { NpmRegistry } from 'npm-registry-sdk';
import type { McpContentText } from '../src/types.ts';

vi.mock('npm-registry-sdk');

describe('searchNpmPackages', () => {
  let searchMock: ReturnType<typeof vi.fn>;
  let getPackageMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    searchMock = vi.fn();
    getPackageMock = vi.fn();

    // Configure the mocked NpmsIO constructor to return our specific mock methods
    (NpmRegistry as Mock).mockImplementation(() => {
      return {
        search: searchMock,
        getPackage: getPackageMock,
      };
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return packages with their details when search is successful', async () => {
    const mockSearchResults = {
      total: 2,
      objects: [
        {
          package: { name: 'package1' },
          score: { detail: { popularity: 1 } },
        },
        {
          package: { name: 'package2' },
          score: { detail: { popularity: 0.5 } },
        },
      ],
    };

    const mockPackageInfos = [
      {
        name: 'package1',
        description: 'Test package 1',
        readme: 'Package 1 readme content',
      },
      {
        name: 'package2',
        description: 'Test package 2',
        readme: 'Package 2 readme content',
      },
    ];

    searchMock.mockResolvedValue(mockSearchResults);
    getPackageMock.mockImplementation((pkg) =>
      Promise.resolve(mockPackageInfos.find((p) => p.name === pkg))
    );

    const result = await searchNpmPackages({
      searchTerm: 'test-package',
    });

    expect(searchMock).toHaveBeenCalledWith('test-package', {
      qualifiers: undefined,
    });
    expect(getPackageMock).toHaveBeenCalledTimes(2);
    expect(JSON.parse((result.content[0] as McpContentText).text)).toEqual([
      {
        name: 'package1',
        description: 'Test package 1',
        readmeSnippet: 'Package 1 readme content',
      },
      {
        name: 'package2',
        description: 'Test package 2',
        readmeSnippet: 'Package 2 readme content',
      },
    ]);
  });

  it('should return "No packages found" when search returns no results', async () => {
    searchMock.mockResolvedValue({ total: 0, objects: [] });

    const result = await searchNpmPackages({
      searchTerm: 'nonexistent-package',
    });

    expect(searchMock).toHaveBeenCalledWith('nonexistent-package', {
      qualifiers: undefined,
    });
    expect(getPackageMock).not.toHaveBeenCalled();
    expect((result.content[0] as McpContentText).text).toBe(
      'No packages found.'
    );
  });

  it('should apply search qualifiers when provided', async () => {
    const mockSearchResults = {
      total: 1,
      objects: [
        {
          package: { name: 'qualified-package' },
          score: { detail: { popularity: 1 } },
        },
      ],
    };

    const mockPackageInfo = {
      name: 'qualified-package',
      description: 'Qualified package',
      readme: 'Qualified package readme',
    };

    searchMock.mockResolvedValue(mockSearchResults);
    getPackageMock.mockResolvedValue(mockPackageInfo);

    const qualifiers = {
      author: 'test-author',
      keywords: 'test',
    };

    const result = await searchNpmPackages({
      searchTerm: 'test-package',
      qualifiers,
    });

    expect(searchMock).toHaveBeenCalledWith('test-package', { qualifiers });
    expect(getPackageMock).toHaveBeenCalledWith('qualified-package');
    expect(JSON.parse((result.content[0] as McpContentText).text)).toEqual([
      {
        name: 'qualified-package',
        description: 'Qualified package',
        readmeSnippet: 'Qualified package readme',
      },
    ]);
  });

  it('should handle packages with missing description or readme', async () => {
    const mockSearchResults = {
      total: 1,
      objects: [
        {
          package: { name: 'incomplete-package' },
          score: { detail: { popularity: 1 } },
        },
      ],
    };

    const mockPackageInfo = {
      name: 'incomplete-package',
      description: undefined,
      readme: undefined,
    };

    searchMock.mockResolvedValue(mockSearchResults);
    getPackageMock.mockResolvedValue(mockPackageInfo);

    const result = await searchNpmPackages({
      searchTerm: 'incomplete-package',
    });

    expect(JSON.parse((result.content[0] as McpContentText).text)).toEqual([
      {
        name: 'incomplete-package',
        description: 'No description available.',
        readmeSnippet: 'README not available.',
      },
    ]);
  });

  it('should handle search errors gracefully', async () => {
    const error = new Error('Search failed');
    searchMock.mockRejectedValue(error);

    const result = await searchNpmPackages({
      searchTerm: 'test-package',
    });

    expect(result).toEqual({
      content: [
        {
          text: 'Failed to search npm packages for "test-package". Error: Search failed',
          type: 'text',
        },
      ],
      isError: true,
    });
    expect(getPackageMock).not.toHaveBeenCalled();
  });
});
