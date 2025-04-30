import { describe, it, expect, vi } from "vitest";
import { z } from "zod";
import runJsEphemeral, { argSchema } from "../src/tools/runJsEphemeral";
import { DEFAULT_NODE_IMAGE } from "../src/utils";

vi.mock("fs/promises", async () => {
  const actual = await vi.importActual<typeof import("fs/promises")>(
    "fs/promises"
  );
  return {
    ...actual,
    copyFile: vi.fn(async (src, dest) => {
      console.log(`Mocked copyFile from ${src} to ${dest}`);
      // no-op as copyFile is used within runJsEphemeral to copy files to the host system
      // and we don't want to actually copy files in the test environment
    }),
  };
});

describe("argSchema", () => {
  it("should use default values for image and dependencies", () => {
    const parsed = z.object(argSchema).parse({ code: "console.log(1);" });
    expect(parsed.image).toBe(DEFAULT_NODE_IMAGE);
    expect(parsed.dependencies).toEqual([]);
    expect(parsed.code).toBe("console.log(1);");
  });

  it("should accept valid custom image and dependencies", () => {
    const input = {
      image: DEFAULT_NODE_IMAGE,
      dependencies: [
        { name: "lodash", version: "^4.17.21" },
        { name: "axios", version: "^1.0.0" },
      ],
      code: "console.log('hi');",
    };
    const parsed = z.object(argSchema).parse(input);
    expect(parsed.image).toBe(DEFAULT_NODE_IMAGE);
    expect(parsed.dependencies.length).toBe(2);
    expect(parsed.dependencies[0]).toEqual({
      name: "lodash",
      version: "^4.17.21",
    });
    expect(parsed.code).toBe("console.log('hi');");
  });
});

describe("should run runJsEphemeral", () => {
  it("shoud run runJsEphemeral base", async () => {
    const result = await runJsEphemeral({
      code: "console.log('Hello, world!');",
      dependencies: [],
    });
    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
    expect(result.content.length).toBe(1);
    expect(result.content[0].type).toBe("text");

    if (result.content[0].type === "text") {
      expect(result.content[0].text).toContain("Hello, world!");
    } else {
      throw new Error("Expected content type to be 'text'");
    }
  });

  it("should generate a valid QR code resource", async () => {
    const result = await runJsEphemeral({
      code: `
        import fs from 'fs';
        import qrcode from 'qrcode';

        const url = 'https://nodejs.org/en';
        const outputFile = 'qrcode.png';

        // Generate QR code and save as PNG
        qrcode.toFile(outputFile, url, {
          type: 'png',
        }, function(err) {
          if (err) throw err;
          console.log('QR code saved as PNG!');
        });
  `,
      dependencies: [
        {
          name: "qrcode",
          version: "^1.5.3",
        },
      ],
    });

    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
    expect(result.content.length).toBe(4);
    expect(result.content[0].type).toBe("text");

    if (result.content[0].type === "text") {
      expect(result.content[0].text).toContain("Node.js process output:");
    } else {
      throw new Error("Expected content type to be 'text'");
    }
    expect(result.content[2].type).toBe("image");
    if (result.content[2].type === "image") {
      expect(result.content[2].mimeType).toBe("image/png");
    } else {
      throw new Error("Expected content type to be 'text'");
    }
  }, 15_000);

  it("should save a hello.txt file and return it as a resource", async () => {
    const result = await runJsEphemeral({
      code: `
        import fs from 'fs/promises';
  
        await fs.writeFile('hello test.txt', 'Hello world!');
        console.log('Saved hello test.txt');
      `,
    });

    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
    expect(result.content.length).toBe(3);

    // First item: Node.js process output
    expect(result.content[0].type).toBe("text");
    if (result.content[0].type === "text") {
      expect(result.content[0].text).toContain("Node.js process output:");
      expect(result.content[0].text).toContain("Saved hello test.txt");
    } else {
      throw new Error("Expected first content item to be of type 'text'");
    }

    // Second item: Info about saved file
    expect(result.content[1].type).toBe("text");
    if (result.content[1].type === "text") {
      expect(result.content[1].text).toContain(
        "I saved the file hello test.txt"
      );
    } else {
      throw new Error("Expected second content item to be of type 'text'");
    }

    // Third item: The resource
    expect(result.content[2].type).toBe("resource");
    if (result.content[2].type === "resource") {
      expect(result.content[2].resource.mimeType).toBe("text/plain");
      expect(result.content[2].resource.uri).toContain("hello%20test.txt");
      expect(result.content[2].resource.uri).toContain("file://");
    } else {
      throw new Error("Expected third content item to be of type 'resource'");
    }
  });
});

describe("runJsEphemeral error handling", () => {
  it("should reject when the code throws an exception", async () => {
    await expect(
      runJsEphemeral({ code: "throw new Error('Test error');" })
    ).rejects.toThrow("Test error");
  });
});

describe("runJsEphemeral multiple file outputs", () => {
  it("should handle saving both text and JPEG files correctly", async () => {
    const base64 =
      "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxISEhUSEhIVFhUVFRUVFRUVFRUVFRUVFRUWFhUVFRUYHSggGBolGxUVITEhJSkrLi4uFx8zODMsNygtLisBCgoKDg0OGhAQGy0lHyYtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAJ8BPgMBIgACEQEDEQH/xAAbAAACAwEBAQAAAAAAAAAAAAAEBgIDBQABB//EADkQAAIBAgQDBgQEBQUBAAAAAAECAwQRAAUSITFBBhMiUWEHFDJxgZEjQrHB0RUjYnLw8RUz/8QAGQEAAgMBAAAAAAAAAAAAAAAAAwQBAgAF/8QAJBEAAgEEAgEFAAAAAAAAAAAAAQIDBBESITFBBRMiUYGh/9oADAMBAAIRAxEAPwD9YKKKAP/Z";
    const result = await runJsEphemeral({
      code: `
        import fs from 'fs/promises';
        await fs.writeFile('foo.txt', 'Hello Foo');
        const img = Buffer.from('${base64}', 'base64');
        await fs.writeFile('bar.jpg', img);
        console.log('Done writing foo.txt and bar.jpg');
      `,
    });

    // stdout
    const stdout = result.content.find((c) => c.type === "text");
    expect(stdout).toBeDefined();
    if (stdout?.type === "text") {
      expect(stdout.text).toContain("Done writing foo.txt and bar.jpg");
    }

    // resources
    const resources = result.content
      .filter((c) => c.type === "resource")
      .map((c) => (c as any).resource.text);
    expect(resources).toEqual(expect.arrayContaining(["foo.txt", "bar.jpg"]));

    // image
    const images = result.content.filter(
      (c) => c.type === "image"
    ) as Array<any>;
    expect(images).toHaveLength(1);
    expect(images[0].mimeType).toBe("image/jpeg");
  });
});

describe("runJsEphemeral screenshot with Playwright", () => {
  it("should take a screenshot of example.com using Playwright and the Playwright image", async () => {
    const result = await runJsEphemeral({
      code: `
        import { chromium } from 'playwright';

        (async () => {
          const browser = await chromium.launch();
          const page = await browser.newPage();
          await page.goto('https://example.com');
          await page.screenshot({ path: 'example_screenshot.png' });
          await browser.close();
          console.log('Screenshot saved');
        })();
      `,
      dependencies: [
        {
          name: "playwright",
          version: "^1.52.0",
        },
      ],
      image: "mcr.microsoft.com/playwright:v1.52.0-noble",
    });

    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
    expect(result.content.length).toBeGreaterThan(1);

    const output = result.content.find((c) => c.type === "text");
    expect(output).toBeDefined();
    if (output?.type === "text") {
      expect(output.text).toContain("Screenshot saved");
    }

    const image = result.content.find(
      (c) => c.type === "image" && c.mimeType === "image/png"
    );
    expect(image).toBeDefined();
  }, 15_000);
});

describe("runJsEphemeral generate charts", () => {
  it("should correctly generate a chart", async () => {
    const result = await runJsEphemeral({
      code: `
        import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
        import fs from 'fs';

        const width = 800; // Set the width of the chart
        const height = 400; // Set the height of the chart
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
            fs.writeFileSync('chart_test.png', image);
            console.log('Chart saved as chart.png');
        }

        generateChart();
      `,
      dependencies: [
        // You don't need to add this dependency here, as it is already included in the image
        // {
        //   name: "chartjs-node-canvas",
        //   version: "4.0.0",
        // },
      ],
      image: "alfonsograziano/node-chartjs-canvas:latest",
    });

    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
    expect(result.content.length).toBeGreaterThan(1);

    const output = result.content.find((c) => c.type === "text");
    expect(output).toBeDefined();
    if (output?.type === "text") {
      expect(output.text).toContain("Node.js process output:");
    }

    const image = result.content.find(
      (c) => c.type === "image" && c.mimeType === "image/png"
    );
    expect(image).toBeDefined();
  });

  it("shoud still be able to add new dependencies with the node-chartjs-canvas image", async () => {
    const result = await runJsEphemeral({
      code: `
        import _ from 'lodash';
        console.log('_.chunk([1,2,3,4,5], 2):', _.chunk([1,2,3,4,5], 2));
      `,
      dependencies: [{ name: "lodash", version: "^4.17.21" }],
      image: "alfonsograziano/node-chartjs-canvas:latest",
    });

    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
    expect(result.content.length).toBe(1);
    expect(result.content[0].type).toBe("text");

    if (result.content[0].type === "text") {
      expect(result.content[0].text).toContain("[ [ 1, 2 ], [ 3, 4 ], [ 5 ] ]");
    } else {
      throw new Error("Expected content type to be 'text'");
    }
  });
});
