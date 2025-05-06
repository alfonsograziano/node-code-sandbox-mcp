import fs from 'fs/promises';
import path from 'path';
import tmp from 'tmp';
import { pathToFileURL } from 'url';
import mime from 'mime-types';
import { textContent, type McpContent } from './types.ts';
import { isRunningInDocker } from './utils.ts';

export async function prepareWorkspace({
  code,
  dependenciesRecord,
}: {
  code: string;
  dependenciesRecord: Record<string, string>;
}) {
  const localTmp = tmp.dirSync({ unsafeCleanup: true });

  await fs.writeFile(path.join(localTmp.name, 'index.js'), code);
  await fs.writeFile(
    path.join(localTmp.name, 'package.json'),
    JSON.stringify(
      { type: 'module', dependencies: dependenciesRecord },
      null,
      2
    )
  );

  return localTmp;
}

export async function extractOutputsFromDir({
  dirPath,
  outputDir,
}: {
  dirPath: string;
  outputDir: string;
}): Promise<McpContent[]> {
  const contents: McpContent[] = [];
  const imageTypes = new Set(['image/jpeg', 'image/png']);

  await fs.mkdir(outputDir, { recursive: true });

  const dirents = await fs.readdir(dirPath, { withFileTypes: true });

  for (const dirent of dirents) {
    if (!dirent.isFile()) continue;

    const fname = dirent.name;
    if (
      fname === 'index.js' ||
      fname === 'package.json' ||
      fname === 'package-lock.json'
    )
      continue;

    const fullPath = path.join(dirPath, fname);
    const destPath = path.join(outputDir, fname);
    await fs.copyFile(fullPath, destPath);

    const hostPath = path.join(getFilesDir(), fname);
    contents.push(textContent(`I saved the file ${fname} at ${hostPath}`));

    const mimeType = mime.lookup(fname) || 'application/octet-stream';

    if (imageTypes.has(mimeType)) {
      const b64 = await fs.readFile(fullPath, { encoding: 'base64' });
      contents.push({
        type: 'image',
        data: b64,
        mimeType,
      });
    }

    contents.push({
      type: 'resource',
      resource: {
        uri: pathToFileURL(hostPath).href,
        mimeType,
        text: fname,
      },
    });
  }

  return contents;
}

export function getHostOutputDir(): string {
  const isContainer = isRunningInDocker();
  return isContainer
    ? path.resolve(process.env.HOME || process.cwd())
    : getFilesDir();
}

// This FILES_DIR is an env var coming from the user
// JS_SANDBOX_OUTPUT_DIR is kept for retrocompatibility as this is the name of the old env var
export const getFilesDir = () =>
  (process.env.FILES_DIR || process.env.JS_SANDBOX_OUTPUT_DIR) as string;
