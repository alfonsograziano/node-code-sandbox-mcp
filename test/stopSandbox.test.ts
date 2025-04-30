import { describe, it, expect, vi, beforeEach } from "vitest";
import stopSandbox from "../src/tools/stop";
import * as childProcess from "node:child_process";
import * as types from "../src/types";

vi.mock("node:child_process");
vi.mock("../types");

describe("stopSandbox", () => {
  const fakeContainerId = "js-sbx-abc123";

  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(childProcess, "execSync").mockImplementation(() =>
      Buffer.from("")
    );
    vi.spyOn(types, "textContent").mockImplementation((msg) => ({
      type: "text",
      text: msg,
    }));
  });

  it("should remove the container with the given ID", async () => {
    const result = await stopSandbox({ container_id: fakeContainerId });

    expect(childProcess.execSync).toHaveBeenCalledWith(
      `docker rm -f ${fakeContainerId}`
    );

    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: `Container ${fakeContainerId} removed.`,
        },
      ],
    });
  });
});
