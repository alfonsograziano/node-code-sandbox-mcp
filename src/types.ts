import { z } from "zod";

export type McpContent =
  | {
      type: "text";
      text: string;
    }
  | {
      type: "image";
      data: string;
      mimeType: string;
    }
  | {
      type: "audio";
      data: string;
      mimeType: string;
    }
  | {
      type: "resource";
      resource:
        | {
            text: string;
            uri: string;
            mimeType?: string;
          }
        | {
            uri: string;
            blob: string;
            mimeType?: string;
          };
    };

export type McpResponse = {
  content: McpContent[];
  _meta?: Record<string, unknown>;
  isError?: boolean;
};

export const textContent = (text: string): McpContent => ({
  type: "text",
  text,
});
