import { z } from 'zod';
import type { McpResponse } from '../types.ts';
import { textContent } from '../types.ts';
import { logger } from '../logger.ts';

export const argSchema = {
  dependencies: z.array(
    z.object({
      name: z.string(),
      version: z.string().optional(),
    })
  ),
};

export default async function getDependencyTypes({
  dependencies,
}: {
  dependencies: { name: string; version?: string }[];
}): Promise<McpResponse> {
  const results: {
    name: string;
    hasTypes: boolean;
    types?: string;
    typesPackage?: string;
    version?: string;
  }[] = [];

  for (const dep of dependencies) {
    const info: (typeof results)[number] = { name: dep.name, hasTypes: false };
    try {
      const pkgRes = await fetch(`https://registry.npmjs.org/${dep.name}`);
      if (pkgRes.ok) {
        const pkgMeta = (await pkgRes.json()) as any;
        const latestTag = pkgMeta['dist-tags']?.latest as string;
        const versionToUse = dep.version || latestTag;
        const versionData = pkgMeta.versions?.[versionToUse];
        // Check for in-package types
        if (versionData) {
          const typesField = versionData.types || versionData.typings;
          if (typesField) {
            const url = `https://unpkg.com/${dep.name}@${versionToUse}/${typesField}`;
            const contentRes = await fetch(url);
            if (contentRes.ok) {
              info.hasTypes = true;
              info.types = await contentRes.text();
              info.version = versionToUse;
              results.push(info);
              continue;
            }
          }
        }

        // Fallback to @types package
        const sanitized = dep.name.replace('@', '').replace('/', '__');
        const typesName = `@types/${sanitized}`;
        const typesRes = await fetch(
          `https://registry.npmjs.org/${encodeURIComponent(typesName)}`
        );
        if (typesRes.ok) {
          const typesMeta = (await typesRes.json()) as any;
          const typesVersion = typesMeta['dist-tags']?.latest as string;
          const typesVersionData = typesMeta.versions?.[typesVersion];
          const typesField =
            typesVersionData?.types ||
            typesVersionData?.typings ||
            'index.d.ts';
          const url = `https://unpkg.com/${typesName}@${typesVersion}/${typesField}`;
          const contentRes = await fetch(url);
          if (contentRes.ok) {
            info.hasTypes = true;
            info.typesPackage = typesName;
            info.version = typesVersion;
            info.types = await contentRes.text();
          }
        }
      }
    } catch (e) {
      logger.info(`Failed to fetch type info for ${dep.name}: ${e}`);
    }
    results.push(info);
  }

  return { content: [textContent(JSON.stringify(results))] };
}
