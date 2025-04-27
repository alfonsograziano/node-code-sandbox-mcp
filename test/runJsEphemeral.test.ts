import { describe, it, expect } from "vitest";
import { z } from "zod";
import { argSchema } from "../src/tools/runJsEphemeral";

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

  it("shoud run runJsEphemeral", async () => {
    const { default: runJsEphemeral } = await import(
      "../src/tools/runJsEphemeral"
    );
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
    const { default: runJsEphemeral } = await import(
      "../src/tools/runJsEphemeral"
    );

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
    expect(result.content.length).toBe(2);
    expect(result.content[0].type).toBe("text");

    if (result.content[0].type === "text") {
      expect(result.content[0].text).toContain("Node.js process output:");
    } else {
      throw new Error("Expected content type to be 'text'");
    }
    expect(result.content[1].type).toBe("image");
    if (result.content[1].type === "image") {
      expect(result.content[1].mimeType).toBe("image/png");
    } else {
      throw new Error("Expected content type to be 'text'");
    }
  });

  it("should save a hello.txt file and return it as a resource", async () => {
    const { default: runJsEphemeral } = await import(
      "../src/tools/runJsEphemeral"
    );

    const result = await runJsEphemeral({
      code: `
        import fs from 'fs/promises';
  
        await fs.writeFile('hello.txt', 'Hello world!');
        console.log('Saved hello.txt');
      `,
    });

    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
    expect(result.content.length).toBe(2);
    expect(result.content[0].type).toBe("text");

    if (result.content[0].type === "text") {
      expect(result.content[0].text).toContain("Node.js process output:");
      expect(result.content[0].text).toContain("Saved hello.txt");
    } else {
      throw new Error("Expected first content item to be of type 'text'");
    }

    expect(result.content[1].type).toBe("resource");
    if (result.content[1].type === "resource") {
      expect(result.content[1].resource.mimeType).toBe("text/plain");
      expect(result.content[1].resource.uri).toBe("hello.txt");

      if ("blob" in result.content[1].resource) {
        expect(
          Buffer.from(result.content[1].resource.blob, "base64").toString(
            "utf8"
          )
        ).toBe("Hello world!");
      }
    } else {
      throw new Error("Expected second content item to be of type 'resource'");
    }
  });
});
