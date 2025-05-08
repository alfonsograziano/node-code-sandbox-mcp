import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as tmp from 'tmp';
import { z } from 'zod';
import runJsEphemeral, { argSchema } from '../src/tools/runJsEphemeral.ts';
import { DEFAULT_NODE_IMAGE } from '../src/utils.ts';
import { describeIfLocal } from './utils.ts';
import type {
  McpContentImage,
  McpContentResource,
  McpContentText,
  McpContentTextResource,
} from '../src/types.ts';

let tmpDir: tmp.DirResult;

describe('runJsEphemeral', () => {
  beforeEach(() => {
    tmpDir = tmp.dirSync({ unsafeCleanup: true });
    process.env.FILES_DIR = tmpDir.name;
  });

  afterEach(() => {
    tmpDir.removeCallback();
    delete process.env.FILES_DIR;
  });
  describe('argSchema', () => {
    it('should use default values for image and dependencies', () => {
      const parsed = z.object(argSchema).parse({ code: 'console.log(1);' });
      expect(parsed.image).toBe(DEFAULT_NODE_IMAGE);
      expect(parsed.dependencies).toEqual([]);
      expect(parsed.code).toBe('console.log(1);');
    });

    it('should accept valid custom image and dependencies', () => {
      const input = {
        image: DEFAULT_NODE_IMAGE,
        dependencies: [
          { name: 'lodash', version: '^4.17.21' },
          { name: 'axios', version: '^1.0.0' },
        ],
        code: "console.log('hi');",
      };
      const parsed = z.object(argSchema).parse(input);
      expect(parsed.image).toBe(DEFAULT_NODE_IMAGE);
      expect(parsed.dependencies.length).toBe(2);
      expect(parsed.dependencies[0]).toEqual({
        name: 'lodash',
        version: '^4.17.21',
      });
      expect(parsed.code).toBe("console.log('hi');");
    });
  });

  describe('should run runJsEphemeral', () => {
    it('shoud run runJsEphemeral base', async () => {
      const result = await runJsEphemeral({
        code: "console.log('Hello, world!');",
        dependencies: [],
      });
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.content.length).toBeGreaterThan(0);
      expect(result.content[0].type).toBe('text');

      if (result.content[0].type === 'text') {
        expect(result.content[0].text).toContain('Hello, world!');
      } else {
        throw new Error("Expected content type to be 'text'");
      }
    });

    it('should generate telemetry', async () => {
      const result = await runJsEphemeral({
        code: "console.log('Hello telemetry!');",
        dependencies: [],
      });

      const telemetryItem = result.content.find(
        (c) => c.type === 'text' && c.text.startsWith('Telemetry:')
      );
      expect(telemetryItem).toBeDefined();
      if (telemetryItem?.type === 'text') {
        const telemetry = JSON.parse(
          telemetryItem.text.replace('Telemetry:\n', '')
        );
        expect(telemetry).toHaveProperty('installTimeMs');
        expect(typeof telemetry.installTimeMs).toBe('number');
        expect(telemetry).toHaveProperty('runTimeMs');
        expect(typeof telemetry.runTimeMs).toBe('number');
        expect(telemetry).toHaveProperty('installOutput');
        expect(typeof telemetry.installOutput).toBe('string');
      } else {
        throw new Error("Expected telemetry item to be of type 'text'");
      }
    });

    it('should hang indefinitely until a timeout error gets triggered', async () => {
      //Simulating a 10 seconds timeout
      process.env.RUN_SCRIPT_TIMEOUT = '10000';
      const result = await runJsEphemeral({
        code: `
          (async () => {
            console.log("🕒 Hanging for 20 seconds…");
            await new Promise((resolve) => setTimeout(resolve, 20_000));
            console.log("✅ Done waiting 20 seconds, exiting now.");
          })();
           `,
      });

      //Cleanup
      delete process.env.RUN_SCRIPT_TIMEOUT;

      const execError = result.content.find(
        (item) =>
          item.type === 'text' &&
          item.text.startsWith('Error during execution:')
      );
      expect(execError).toBeDefined();
      expect((execError as McpContentText).text).toContain('ETIMEDOUT');

      const telemetryText = result.content.find(
        (item) => item.type === 'text' && item.text.startsWith('Telemetry:')
      );
      expect(telemetryText).toBeDefined();
    }, 20_000);

    it('should report execution error for runtime exceptions', async () => {
      const result = await runJsEphemeral({
        code: `throw new Error('boom');`,
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();

      // should hit our "other errors" branch
      const execError = result.content.find(
        (item) =>
          item.type === 'text' &&
          (item as McpContentText).text.startsWith('Error during execution:')
      );
      expect(execError).toBeDefined();
      expect((execError as McpContentText).text).toContain('Error: boom');

      // telemetry should still be returned
      const telemetryText = result.content.find(
        (item) =>
          item.type === 'text' &&
          (item as McpContentText).text.startsWith('Telemetry:')
      );
      expect(telemetryText).toBeDefined();
    });

    it('should skip npm install if no dependencies are provided', async () => {
      const result = await runJsEphemeral({
        code: "console.log('No deps');",
        dependencies: [],
      });

      const telemetryItem = result.content.find(
        (c) => c.type === 'text' && c.text.startsWith('Telemetry:')
      );

      expect(telemetryItem).toBeDefined();
      if (telemetryItem?.type === 'text') {
        const telemetry = JSON.parse(
          telemetryItem.text.replace('Telemetry:\n', '')
        );

        expect(telemetry.installTimeMs).toBe(0);
        expect(telemetry.installOutput).toBe(
          'Skipped npm install (no dependencies)'
        );
      }
    });

    it('should generate a valid QR code resource', async () => {
      const result = await runJsEphemeral({
        code: `
          import fs from 'fs';
          import qrcode from 'qrcode';
    
          const url = 'https://nodejs.org/en';
          const outputFile = './files/qrcode.png';
    
          qrcode.toFile(outputFile, url, {
            type: 'png',
          }, function(err) {
            if (err) throw err;
            console.log('QR code saved as PNG!');
          });
        `,
        dependencies: [
          {
            name: 'qrcode',
            version: '^1.5.3',
          },
        ],
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();

      // Find process output
      const processOutput = result.content.find(
        (item) =>
          item.type === 'text' &&
          item.text.startsWith('Node.js process output:')
      );
      expect(processOutput).toBeDefined();
      expect((processOutput as McpContentText).text).toContain(
        'QR code saved as PNG!'
      );

      // Find QR image
      const imageResource = result.content.find(
        (item) => item.type === 'image' && item.mimeType === 'image/png'
      );
      expect(imageResource).toBeDefined();
    }, 15_000);

    it('should save a hello.txt file and return it as a resource', async () => {
      const result = await runJsEphemeral({
        code: `
          import fs from 'fs/promises';
          await fs.writeFile('./files/hello test.txt', 'Hello world!');
          console.log('Saved hello test.txt');
        `,
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();

      // Find process output
      const processOutput = result.content.find(
        (item) =>
          item.type === 'text' &&
          item.text.startsWith('Node.js process output:')
      );
      expect(processOutput).toBeDefined();
      expect((processOutput as McpContentText).text).toContain(
        'Saved hello test.txt'
      );

      // Find file change info
      const changeInfo = result.content.find(
        (item) =>
          item.type === 'text' && item.text.startsWith('List of changed files:')
      );
      expect(changeInfo).toBeDefined();
      expect((changeInfo as McpContentText).text).toContain(
        '- hello test.txt was created'
      );

      // Find the resource
      const resource = result.content.find((item) => item.type === 'resource');
      expect(resource).toBeDefined();
      expect((resource as McpContentResource).resource.mimeType).toBe(
        'text/plain'
      );
      expect((resource as McpContentResource).resource.uri).toContain(
        'hello%20test.txt'
      );
      expect((resource as McpContentResource).resource.uri).toContain(
        'file://'
      );
      if ('text' in (resource as McpContentResource).resource) {
        expect((resource as McpContentTextResource).resource.text).toBe(
          'hello test.txt'
        );
      } else {
        throw new Error("Expected resource to have a 'text' property");
      }

      // Find telemetry info
      const telemetry = result.content.find(
        (item) => item.type === 'text' && item.text.startsWith('Telemetry:')
      );
      expect(telemetry).toBeDefined();
      expect((telemetry as McpContentText).text).toContain('"installTimeMs"');
      expect((telemetry as McpContentText).text).toContain('"runTimeMs"');
    });
  }, 10_000);

  describe('runJsEphemeral error handling', () => {
    it('should return an execution error and telemetry when the code throws', async () => {
      const result = await runJsEphemeral({
        code: "throw new Error('Test error');",
      });

      const execError = result.content.find(
        (item) =>
          item.type === 'text' &&
          item.text.startsWith('Error during execution:')
      );
      expect(execError).toBeDefined();
      expect((execError as McpContentText).text).toContain('Test error');

      const telemetryText = result.content.find(
        (item) => item.type === 'text' && item.text.startsWith('Telemetry:')
      );
      expect(telemetryText).toBeDefined();
    });
  });

  describe('runJsEphemeral multiple file outputs', () => {
    it('should handle saving both text and JPEG files correctly', async () => {
      const base64 =
        '/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxISEhUSEhIVFhUVFRUVFRUVFRUVFRUVFRUWFhUVFRUYHSggGBolGxUVITEhJSkrLi4uFx8zODMsNygtLisBCgoKDg0OGhAQGy0lHyYtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAJ8BPgMBIgACEQEDEQH/xAAbAAACAwEBAQAAAAAAAAAAAAAEBgIDBQABB//EADkQAAIBAgQDBgQEBQUBAAAAAAECAwQRAAUSITFBBhTiUWEHFDJxgZEjQrHB0RUjYnLw8RUz/8QAGQEAAgMBAAAAAAAAAAAAAAAAAwQBAgAF/8QAJBEAAgEEAgEFAAAAAAAAAAAAAQIDBBESITFBBRMiUYGh/9oADAMBAAIRAxEAPwD9YKKKAP/Z';

      const result = await runJsEphemeral({
        code: `
          import fs from 'fs/promises';
          await fs.writeFile('./files/foo.txt', 'Hello Foo');
          const img = Buffer.from('${base64}', 'base64');
          await fs.writeFile('./files/bar.jpg', img);
          console.log('Done writing foo.txt and bar.jpg');
        `,
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();

      // stdout
      const stdout = result.content.find(
        (c) =>
          c.type === 'text' &&
          c.text.includes('Done writing foo.txt and bar.jpg')
      );
      expect(stdout).toBeDefined();
      expect((stdout as McpContentText).text).toContain(
        'Done writing foo.txt and bar.jpg'
      );

      // resource names (foo.txt and bar.jpg)
      const savedResourceNames = result.content
        .filter((c) => c.type === 'resource')
        .map((c) => (c as McpContentTextResource).resource.text);

      expect(savedResourceNames).toEqual(
        expect.arrayContaining(['foo.txt', 'bar.jpg'])
      );

      // JPEG image check
      const jpegImage = result.content.find(
        (c) => c.type === 'image' && c.mimeType === 'image/jpeg'
      );
      expect(jpegImage).toBeDefined();
    });
  });

  describe('runJsEphemeral screenshot with Playwright', () => {
    it('should take a screenshot of example.com using Playwright and the Playwright image', async () => {
      const result = await runJsEphemeral({
        code: `
          import { chromium } from 'playwright';
  
          (async () => {
            const browser = await chromium.launch();
            const page = await browser.newPage();
            await page.goto('https://example.com');
            await page.screenshot({ path: './files/example_screenshot.png' });
            await browser.close();
            console.log('Screenshot saved');
          })();
        `,
        dependencies: [
          {
            name: 'playwright',
            version: '^1.52.0',
          },
        ],
        image: 'mcr.microsoft.com/playwright:v1.52.0-noble',
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();

      // stdout check
      const output = result.content.find(
        (item) => item.type === 'text' && item.text.includes('Screenshot saved')
      );
      expect(output).toBeDefined();
      expect((output as McpContentText).text).toContain('Screenshot saved');

      // PNG image resource check
      const image = result.content.find(
        (item) => item.type === 'image' && item.mimeType === 'image/png'
      );
      expect(image).toBeDefined();
    }, 15_000);
  });

  // Skipping this on the CI as it requires a lot of resources
  // and an image that is not available in the CI environment
  describeIfLocal(
    'runJsEphemeral generate charts',
    () => {
      it('should correctly generate a chart', async () => {
        const result = await runJsEphemeral({
          code: `
          import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
          import fs from 'fs';
  
          const width = 800;
          const height = 400;
          const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });
  
          const data = {
            labels: ['January', 'February', 'March', 'April', 'May', 'June'],
            datasets: [{
              label: 'Monthly Revenue Growth (2025)',
              data: [12000, 15500, 14200, 18300, 21000, 24500],
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
            }]
          };
  
          const config = {
            type: 'bar',
            data: data,
            options: {
              responsive: true,
              plugins: {
                legend: {
                  display: true,
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Monthly Revenue Growth (2025)',
                }
              },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: 'Month'
                  }
                },
                y: {
                  title: {
                    display: true,
                    text: 'Revenue (USD)'
                  },
                  beginAtZero: true
                }
              }
            }
          };
  
          async function generateChart() {
            const image = await chartJSNodeCanvas.renderToBuffer(config);
            fs.writeFileSync('./files/chart_test.png', image);
            console.log('Chart saved as chart.png');
          }
  
          generateChart();
        `,
          image: 'alfonsograziano/node-chartjs-canvas:latest',
        });

        expect(result).toBeDefined();
        expect(result.content).toBeDefined();

        const output = result.content.find(
          (item) =>
            item.type === 'text' &&
            typeof item.text === 'string' &&
            item.text.includes('Chart saved as chart.png')
        );
        expect(output).toBeDefined();
        expect((output as { type: 'text'; text: string }).text).toContain(
          'Chart saved as chart.png'
        );

        const image = result.content.find(
          (item) =>
            item.type === 'image' &&
            'mimeType' in item &&
            item.mimeType === 'image/png'
        );
        expect(image).toBeDefined();
        expect((image as McpContentImage).mimeType).toBe('image/png');
      });

      it('should still be able to add new dependencies with the node-chartjs-canvas image', async () => {
        const result = await runJsEphemeral({
          code: `
          import _ from 'lodash';
          console.log('_.chunk([1,2,3,4,5], 2):', _.chunk([1,2,3,4,5], 2));
        `,
          dependencies: [{ name: 'lodash', version: '^4.17.21' }],
          image: 'alfonsograziano/node-chartjs-canvas:latest',
        });

        expect(result).toBeDefined();
        expect(result.content).toBeDefined();

        const output = result.content.find(
          (item) =>
            item.type === 'text' &&
            typeof item.text === 'string' &&
            item.text.includes('[ [ 1, 2 ], [ 3, 4 ], [ 5 ] ]')
        );
        expect(output).toBeDefined();
        expect((output as McpContentText).text).toContain(
          '[ [ 1, 2 ], [ 3, 4 ], [ 5 ] ]'
        );
      });

      it('should generate a Mermaid sequence diagram SVG file', async () => {
        const result = await runJsEphemeral({
          code: `
            import fs from "fs";
            import { run } from "@mermaid-js/mermaid-cli";
      
            const diagramDefinition = \`
            sequenceDiagram
                participant App as Application
                participant KC as Keycloak
                participant IDP as Identity Provider
      
                %% Initial Sign-In
                App->>KC: "Go authenticate!"
                KC->>App: Redirect to Keycloak login
                KC->>IDP: "Which IDP? (MyGovID / EntraID)"
                IDP-->>KC: ID Token + Refresh Token (1 day)
                KC-->>App: KC Tokens (1 day)
      
                %% After 24 Hours
                App->>KC: Request new tokens (expired refresh token)
                alt KC session still active (<14 days)
                    KC-->>App: New tokens (1 day)
                else KC session expired (>14 days)
                    KC->>IDP: Redirect to reauthenticate
                    IDP-->>KC: Fresh ID + Refresh Tokens
                    KC-->>App: New KC Tokens (1 day)
                end
            \`;
      
            fs.writeFileSync("./files/authDiagram.mmd", diagramDefinition, "utf8");
            console.log("Mermaid definition saved to authDiagram.mmd");
      
            console.time("test");
            await run("./files/authDiagram.mmd", "output.svg");
            console.timeEnd("test");
            console.log("Diagram generated as output.svg");
          `,
          dependencies: [
            { name: '@mermaid-js/mermaid-cli', version: '^11.4.2' },
          ],
          image: 'alfonsograziano/node-chartjs-canvas:latest',
        });

        // Ensure result exists
        expect(result).toBeDefined();
        expect(result.content).toBeDefined();

        // Validate Mermaid diagram creation log
        const logOutput = result.content.find(
          (item) =>
            item.type === 'text' &&
            item.text.includes('Diagram generated as output.svg')
        );
        expect(logOutput).toBeDefined();

        // Validate .mmd file was created
        const mmdFile = result.content.find(
          (item) =>
            item.type === 'resource' &&
            item.resource?.uri?.endsWith('authDiagram.mmd')
        );
        expect(mmdFile).toBeDefined();

        // Optional: Validate that the SVG file was generated
        const svgLog = result.content.find(
          (item) =>
            item.type === 'text' &&
            item.text.includes('Diagram generated as output.svg')
        );
        expect(svgLog).toBeDefined();
      });
    },
    50_000
  );
});
