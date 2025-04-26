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
    console.log(result);
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
});
