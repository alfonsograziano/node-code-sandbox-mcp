import path from 'node:path';
import { stat, readFile } from 'node:fs/promises';
import fg from 'fast-glob';
import { pathToFileURL } from 'node:url';

import mime from 'mime-types';

import { getFilesDir } from './runUtils.ts';
import { type McpContent, textContent } from './types.ts';
import { isRunningInDocker } from './utils.ts';

type ChangeType = 'created' | 'updated' | 'deleted';
type Change = {
  type: ChangeType;
  path: string;
  isDirectory: boolean;
};

type FileSnapshot = Record<string, { mtimeMs: number; isDirectory: boolean }>;

export const getMountPointDir = () => {
  if (isRunningInDocker()) {
    return '/root';
  }
  return getFilesDir();
};

export async function getSnapshot(dir: string): Promise<FileSnapshot> {
  const snapshot: FileSnapshot = {};

  // Use fast-glob to get all files and directories, excluding .git and node_modules
  const entries = await fg(['**/*'], {
    cwd: dir,
    dot: true,
    onlyFiles: false,
    followSymbolicLinks: false,
    ignore: ['.git/**', 'node_modules/**'],
    stats: true,
  });

  for (const entry of entries) {
    // entry is a FastGlobEntry (has .path and .stats)
    const fullPath = path.join(
      dir,
      typeof entry === 'string' ? entry : entry.path
    );
    const statsObj =
      typeof entry === 'string' ? await stat(fullPath) : entry.stats;
    if (!statsObj) continue;
    snapshot[fullPath] = {
      mtimeMs: statsObj.mtimeMs,
      isDirectory: statsObj.isDirectory(),
    };
  }

  return snapshot;
}

export async function detectChanges(
  prevSnapshot: FileSnapshot,
  dir: string,
  sinceTimeMs: number
): Promise<Change[]> {
  const changes: Change[] = [];
  const currentSnapshot = await getSnapshot(dir);

  const allPaths = new Set([
    ...Object.keys(prevSnapshot),
    ...Object.keys(currentSnapshot),
  ]);

  for (const filePath of allPaths) {
    const prev = prevSnapshot[filePath];
    const curr = currentSnapshot[filePath];

    if (!prev && curr && curr.mtimeMs >= sinceTimeMs) {
      changes.push({
        type: 'created',
        path: filePath,
        isDirectory: curr.isDirectory,
      });
    } else if (prev && !curr) {
      changes.push({
        type: 'deleted',
        path: filePath,
        isDirectory: prev.isDirectory,
      });
    } else if (
      prev &&
      curr &&
      curr.mtimeMs > prev.mtimeMs &&
      curr.mtimeMs >= sinceTimeMs
    ) {
      changes.push({
        type: 'updated',
        path: filePath,
        isDirectory: curr.isDirectory,
      });
    }
  }

  return changes;
}

export async function changesToMcpContent(
  changes: Change[]
): Promise<McpContent[]> {
  const contents: McpContent[] = [];
  const imageTypes = new Set(['image/jpeg', 'image/png']);

  // Build single summary message
  const summaryLines = changes.map((change) => {
    const fname = path.basename(change.path);
    return `- ${fname} was ${change.type}`;
  });

  if (summaryLines.length > 0) {
    contents.push(
      textContent(`List of changed files:\n${summaryLines.join('\n')}`)
    );
  }

  // Add image/resource entries for created/updated (not deleted)
  for (const change of changes) {
    if (change.type === 'deleted') continue;

    const mimeType = mime.lookup(change.path) || 'application/octet-stream';

    if (imageTypes.has(mimeType)) {
      const b64 = await readFile(change.path, {
        encoding: 'base64',
      });
      contents.push({
        type: 'image',
        data: b64,
        mimeType,
      });
    }

    const hostPath = path.join(getFilesDir(), path.basename(change.path));

    contents.push({
      type: 'resource',
      resource: {
        uri: pathToFileURL(hostPath).href,
        mimeType,
        text: path.basename(change.path),
      },
    });
  }

  return contents;
}
