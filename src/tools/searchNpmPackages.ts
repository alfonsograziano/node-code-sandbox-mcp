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
      'The term to search for in npm packages. Should contain all relevant context. Should ideally be text that might appear in the package name, description, or keywords. Use plus signs (+) to combine related terms (e.g., "react+components" for React component libraries). For filtering by author, maintainer, or scope, use the qualifiers field instead of including them in the search term. Examples: "express" for Express.js, "ui+components" for UI component packages, "testing+jest" for Jest testing utilities.'
    ),
  qualifiers: z
    .object({
      author: z.string().optional().describe('Filter by package author name'),
      maintainer: z
        .string()
        .optional()
        .describe('Filter by package maintainer name'),
      scope: z
        .string()
        .optional()
        .describe('Filter by npm scope (e.g., "@vue" for Vue.js packages)'),
      keywords: z.string().optional().describe('Filter by package keywords'),
      not: z
        .string()
        .optional()
        .describe('Exclude packages matching this criteria (e.g., "insecure")'),
      is: z
        .string()
        .optional()
        .describe(
          'Include only packages matching this criteria (e.g., "unstable")'
        ),
      boostExact: z
        .string()
        .optional()
        .describe('Boost exact matches for this term in search results'),
    })
    .optional()
    .describe(
      'Optional qualifiers to filter the search results. For example, { not: "insecure" } will exclude insecure packages, { author: "sindresorhus" } will only show packages by that author, { scope: "@vue" } will only show Vue.js scoped packages.'
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
 * Search for npm packages by a search term and get their name, description, and a README snippet.
 * This is an MCP (Model Context Protocol) tool that allows LLMs to discover and analyze npm packages.
 *
 * Returns up to 5 packages sorted by popularity, each containing:
 * - Package name
 * - Description
 * - README snippet (first 500 characters)
 *
 * Use qualifiers to filter results by author, scope, keywords, or exclude unwanted packages.
 *
 * @param {SearchNpmPackagesToolSchemaType} params - Search parameters including search term and optional qualifiers
 * @returns {Promise<McpResponse>} A response containing the search results formatted as JSON, or an error message
 *
 * @example
 * // Basic search
 * searchNpmPackages({ searchTerm: "react" })
 *
 * @example
 * // Search with qualifiers
 * searchNpmPackages({
 *   searchTerm: "ui+components",
 *   qualifiers: { scope: "@mui", not: "deprecated" }
 * })
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
