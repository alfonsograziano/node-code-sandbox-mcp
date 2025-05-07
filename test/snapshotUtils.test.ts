import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as tmp from 'tmp';
import * as fs from 'fs';
import * as path from 'path';
import { getSnapshot, detectChanges } from '../src/snapshotUtils.ts';

let tmpDir: tmp.DirResult;

function createFile(filePath: string, content = '') {
  fs.writeFileSync(filePath, content);
}

function createDir(dirPath: string) {
  fs.mkdirSync(dirPath);
}

describe('Filesystem snapshot and change detection', () => {
  beforeEach(() => {
    tmpDir = tmp.dirSync({ unsafeCleanup: true });
  });

  afterEach(() => {
    tmpDir.removeCallback();
  });

  it('getSnapshot returns correct structure for files and directories', async () => {
    const file1 = path.join(tmpDir.name, 'file1.txt');
    const subDir = path.join(tmpDir.name, 'sub');
    const file2 = path.join(subDir, 'file2.txt');

    createFile(file1, 'Hello');
    createDir(subDir);
    createFile(file2, 'World');

    const snapshot = await getSnapshot(tmpDir.name);

    expect(Object.keys(snapshot)).toContain(file1);
    expect(Object.keys(snapshot)).toContain(subDir);
    expect(Object.keys(snapshot)).toContain(file2);

    expect(snapshot[file1].isDirectory).toBe(false);
    expect(snapshot[subDir].isDirectory).toBe(true);
    expect(snapshot[file2].isDirectory).toBe(false);
  });

  it('detectChanges detects created files', async () => {
    const initialSnapshot = await getSnapshot(tmpDir.name);

    const newFile = path.join(tmpDir.name, 'newFile.txt');
    createFile(newFile, 'New content');

    const changes = await detectChanges(
      initialSnapshot,
      tmpDir.name,
      Date.now() - 1000
    );

    expect(changes).toEqual([
      {
        type: 'created',
        path: newFile,
        isDirectory: false,
      },
    ]);
  });

  it('detectChanges detects deleted files', async () => {
    const fileToDelete = path.join(tmpDir.name, 'toDelete.txt');
    createFile(fileToDelete, 'To be deleted');

    const snapshotBeforeDelete = await getSnapshot(tmpDir.name);
    fs.unlinkSync(fileToDelete);

    const changes = await detectChanges(
      snapshotBeforeDelete,
      tmpDir.name,
      Date.now() - 1000
    );

    expect(changes).toEqual([
      {
        type: 'deleted',
        path: fileToDelete,
        isDirectory: false,
      },
    ]);
  });

  it('detectChanges detects updated files', async () => {
    const fileToUpdate = path.join(tmpDir.name, 'update.txt');
    createFile(fileToUpdate, 'Original');

    const snapshot = await getSnapshot(tmpDir.name);

    // Wait to ensure mtimeMs changes
    await new Promise((resolve) => setTimeout(resolve, 20));
    fs.writeFileSync(fileToUpdate, 'Updated');

    const changes = await detectChanges(
      snapshot,
      tmpDir.name,
      Date.now() - 1000
    );

    expect(changes).toEqual([
      {
        type: 'updated',
        path: fileToUpdate,
        isDirectory: false,
      },
    ]);
  });
});
