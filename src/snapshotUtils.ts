import * as fs from 'fs';
import * as path from 'path';
import { type McpContent, textContent } from './types.ts';
import mime from 'mime-types';
import { pathToFileURL } from 'url';
import { getFilesDir } from './runUtils.ts';
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

export function getSnapshot(dir: string): FileSnapshot {
  const snapshot: FileSnapshot = {};

  function walk(currentPath: string) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      const stats = fs.statSync(fullPath);

      snapshot[fullPath] = {
        mtimeMs: stats.mtimeMs,
        isDirectory: entry.isDirectory(),
      };

      if (entry.isDirectory()) {
        walk(fullPath);
      }
    }
  }

  walk(dir);
  return snapshot;
}

export function detectChanges(
  prevSnapshot: FileSnapshot,
  dir: string,
  sinceTimeMs: number
): Change[] {
  const changes: Change[] = [];
  const currentSnapshot = getSnapshot(dir);

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
      const b64 = await fs.promises.readFile(change.path, {
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
