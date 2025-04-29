import { describe, it, expect } from "vitest";
import { z } from "zod";
import runJsEphemeral, { argSchema } from "../src/tools/runJsEphemeral";

describe("argSchema", () => {
  it("should use default values for image and dependencies", () => {
    const parsed = z.object(argSchema).parse({ code: "console.log(1);" });
    expect(parsed.image).toBe("node:20-slim");
    expect(parsed.dependencies).toEqual([]);
    expect(parsed.code).toBe("console.log(1);");
  });

  it("should accept valid custom image and dependencies", () => {
    const input = {
      image: "node:18-alpine",
      dependencies: [
        { name: "lodash", version: "^4.17.21" },
        { name: "axios", version: "^1.0.0" },
      ],
      code: "console.log('hi');",
    };
    const parsed = z.object(argSchema).parse(input);
    expect(parsed.image).toBe("node:18-alpine");
    expect(parsed.dependencies.length).toBe(2);
    expect(parsed.dependencies[0]).toEqual({
      name: "lodash",
      version: "^4.17.21",
    });
    expect(parsed.code).toBe("console.log('hi');");
  });
});

describe("should run runJsEphemeral", () => {
  it("shoud run runJsEphemeral", async () => {
    const result = await runJsEphemeral({
      code: "console.log('Hello, world!');",
      dependencies: [{ name: "lodash", version: "^4.17.21" }],
    });
    // console.log(JSON.stringify(result, null, 2));
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
  });

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
