import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { tmpdir } from 'os';
import { mkdtempSync, rmSync } from 'fs';
import path from 'path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import dotenv from 'dotenv';
import { type McpResponse } from '../src/types.ts';
import fs from 'fs';
import { execSync } from 'child_process';
import { normalizeMountPath } from './utils.ts';

dotenv.config();

describe('runJsEphemeral via MCP client (files) ', () => {
  let hostWorkspaceDir: string;
  let containerWorkspaceDir: string;
  let client: Client;

  beforeAll(async () => {
    hostWorkspaceDir = mkdtempSync(path.join(tmpdir(), 'ws-'));
    containerWorkspaceDir = normalizeMountPath(hostWorkspaceDir);

    // Build the latest version of the Docker image
    // I need to build the image before running the test which requires it

    execSync('docker build -t alfonsograziano/node-code-sandbox-mcp .', {
      stdio: 'inherit',
    });

    client = new Client({ name: 'node_js_sandbox_test', version: '1.0.0' });

    await client.connect(
      new StdioClientTransport({
        command: 'docker',
        args: [
          'run',
          '-i',
          '--rm',
          '-v',
          '/var/run/docker.sock:/var/run/docker.sock',
          '-v',
          `${hostWorkspaceDir}:/root`,
          '-e',
          `FILES_DIR=${containerWorkspaceDir}`,
          'alfonsograziano/node-code-sandbox-mcp',
        ],
      })
    );
  }, 200_000);

  afterAll(() => {
    rmSync(hostWorkspaceDir, { recursive: true, force: true });
  });

  it('should run a console.log', async () => {
    const code = `console.log("Hello from workspace!");`;

    const result = (await client.callTool({
      name: 'run_js_ephemeral',
      arguments: { code, dependencies: [] },
    })) as { content: Array<{ type: string; text: string }> };

    expect(result).toBeDefined();
    expect(result.content).toBeInstanceOf(Array);
    expect(result.content[0]).toMatchObject({
      type: 'text',
    });

    const outputText = result.content[0].text;
    expect(outputText).toContain('Hello from workspace!');
    expect(outputText).toContain('Node.js process output');
  });

  describe('runJsEphemeral via MCP client (host workspace mounting)', () => {
    it('should read and write files using the host-mounted /files', async () => {
      const inputFileName = 'text.txt';
      const inputFilePath = path.join(hostWorkspaceDir, inputFileName);
      const inputContent = 'This is a file from the host.';
      fs.writeFileSync(inputFilePath, inputContent, 'utf-8');

      const outputFileName = 'output-host.txt';
      const outputContent = 'This file was created in the sandbox.';

      const code = `
        import fs from 'fs';
        const input = fs.readFileSync('./files/${inputFileName}', 'utf-8');
        console.log('Input file content:', input);
        fs.writeFileSync('./files/${outputFileName}', input + ' | ${outputContent}');
        console.log('Files processed.');
      `;

      const result = (await client.callTool({
        name: 'run_js_ephemeral',
        arguments: { code, dependencies: [] },
      })) as McpResponse;

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();

      // Process output
      const processOutput = result.content.find(
        (item) =>
          item.type === 'text' &&
          item.text.startsWith('Node.js process output:')
      );
      expect(processOutput).toBeDefined();
      expect((processOutput as { text: string }).text).toContain(
        'Input file content: This is a file from the host.'
      );
      expect((processOutput as { text: string }).text).toContain(
        'Files processed.'
      );

      // File creation message
      const fileChangeInfo = result.content.find(
        (item) =>
          item.type === 'text' && item.text.startsWith('List of changed files:')
      );
      expect(fileChangeInfo).toBeDefined();
      expect((fileChangeInfo as { text: string }).text).toContain(
        '- output-host.txt was created'
      );

      // Resource
      const resource = result.content.find(
        (item) =>
          item.type === 'resource' &&
          'resource' in item &&
          typeof item.resource?.uri === 'string'
      );
      expect(resource).toBeDefined();
      const resourceData = (
        resource as {
          resource: { mimeType: string; uri: string; text: string };
        }
      ).resource;
      expect(resourceData.mimeType).toBe('text/plain');
      expect(resourceData.uri).toContain('output-host.txt');
      expect(resourceData.uri).toContain('file://');
      expect(resourceData.text).toBe('output-host.txt');

      // Telemetry
      const telemetry = result.content.find(
        (item) => item.type === 'text' && item.text.startsWith('Telemetry:')
      );
      expect(telemetry).toBeDefined();
      expect((telemetry as { text: string }).text).toContain('"installTimeMs"');
      expect((telemetry as { text: string }).text).toContain('"runTimeMs"');
    });
  });
}, 200_000);
