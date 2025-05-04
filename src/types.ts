export type McpContentText = {
  type: 'text';
  text: string;
};

export type McpContentImage = {
  type: 'image';
  data: string;
  mimeType: string;
};

export type McpContentAudio = {
  type: 'audio';
  data: string;
  mimeType: string;
};

export type McpContentTextResource = {
  type: 'resource';
  resource: {
    text: string;
    uri: string;
    mimeType?: string;
  };
};

export type McpContentResource = {
  type: 'resource';
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

export type McpContent =
  | McpContentText
  | McpContentImage
  | McpContentAudio
  | McpContentResource;

export type McpResponse = {
  content: McpContent[];
  _meta?: Record<string, unknown>;
  isError?: boolean;
};

export const textContent = (text: string): McpContent => ({
  type: 'text',
  text,
});
