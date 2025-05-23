import { NpmRegistry, type PackageInfo } from 'npm-registry-sdk';
import { z } from 'zod';

import { logger } from '../logger.ts';
import { type McpResponse, textContent } from '../types.ts';

/**
 * Zod schema for validating npm package search parameters
 */
export const SearchNpmPackagesToolSchema = z.object({
  searchTerm: z
    .string()
    .min(1, { message: 'Search term cannot be empty.' })
    .regex(/^\S+$/, { message: 'Search term cannot contain spaces.' })
    .describe(
      'The term to search for in npm packages. If the user asks for multiple packages, concat the terms with plus signs. Do not concat words that are not related to a spcific package. For example if the user asks for a specific author add it in qualifiers, not in the search term.'
    ),
  qualifiers: z
    .object({
      not: z.string().optional(),
      is: z.string().optional(),
      author: z.string().optional(),
      maintainer: z.string().optional(),
      scope: z.string().optional(),
      keywords: z.string().optional(),
      boostExact: z.string().optional(),
    })
    .optional()
    .describe(
      'Optional qualifiers to filter the search results. For example, { not: "insecure" } will exclude insecure packages.'
    ),
});

type SearchNpmPackagesToolSchemaType = z.infer<
  typeof SearchNpmPackagesToolSchema
>;

type PackageDetails = {
  /** The name of the package */
  name: string;
  /** A brief description of the package */
  description: string;
  /** A snippet from the package's README file */
  readmeSnippet: string;
};

class SearchNpmPackagesTool {
  private readonly registry: NpmRegistry;
  private readonly maxResults = 5;
  private readonly maxReadmeLength = 500;

  constructor() {
    this.registry = new NpmRegistry();
  }

  /**
   * Searches for npm packages based on the provided search term and qualifiers
   * @param {SearchNpmPackagesToolSchemaType} params - Search parameters including search term and optional qualifiers
   * @returns {Promise<McpResponse>} A response containing the search results or an error message
   */
  public async searchPackages({
    searchTerm,
    qualifiers,
  }: SearchNpmPackagesToolSchemaType): Promise<McpResponse> {
    const searchResults = await this.registry.search(searchTerm, {
      qualifiers,
    });

    if (!searchResults.total) {
      return {
        content: [textContent('No packages found.')],
      };
    }

    const packages = searchResults.objects
      .sort((a, b) => b.score.detail.popularity - a.score.detail.popularity)
      .slice(0, this.maxResults)
      .map((result) => result.package.name);

    const packagesInfos = await this.getPackagesDetails(packages);

    return {
      content: [textContent(JSON.stringify(packagesInfos, null, 2))],
    };
  }

  /**
   * Retrieves detailed information for multiple packages
   * @param {string[]} packages - Array of package names to get details for
   * @returns {Promise<PackageDetails[]>} Array of package details
   * @private
   */
  private async getPackagesDetails(
    packages: string[]
  ): Promise<PackageDetails[]> {
    const multiPackageInfo: PackageInfo[] = await Promise.all(
      packages.map((pkg) => this.registry.getPackage(pkg))
    );

    const packagesDetails: PackageDetails[] = [];

    for (const packageInfo of Object.values(multiPackageInfo)) {
      packagesDetails.push({
        name: packageInfo.name,
        description: packageInfo.description || 'No description available.',
        readmeSnippet: this.extractReadmeSnippet(packageInfo.readme),
      });
    }

    return packagesDetails;
  }

  /**
   * Extracts a snippet from a package's README file
   * @param {string | undefined} readme - The full README content
   * @returns {string} A truncated snippet of the README or a default message if README is not available
   * @private
   */
  private extractReadmeSnippet(readme: string | undefined): string {
    if (!readme) {
      return 'README not available.';
    }

    const snippet = readme.substring(0, this.maxReadmeLength);
    return snippet.length === this.maxReadmeLength ? snippet + '...' : snippet;
  }
}

/**
 * Main function to search npm packages
 * @param {SearchNpmPackagesToolSchemaType} params - Search parameters including search term and optional qualifiers
 * @returns {Promise<McpResponse>} A response containing the search results or an error message
 */
export default async function searchNpmPackages(
  params: SearchNpmPackagesToolSchemaType
): Promise<McpResponse> {
  try {
    const tool = new SearchNpmPackagesTool();
    const response = await tool.searchPackages(params);
    return response;
  } catch (error) {
    const errorMessage = `Failed to search npm packages for "${params.searchTerm}". Error: ${error instanceof Error ? error.message : String(error)}`;
    logger.error(errorMessage);
    return {
      content: [textContent(errorMessage)],
      isError: true,
    };
  }
}
