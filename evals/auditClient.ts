import { OpenAI } from 'openai';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

/**
 * Settings for the OpenAIAuditClient
 */
export interface AuditClientSettings {
  apiKey?: string; // OpenAI API key
  model: string; // Model to use for chat completions
}

/**
 * A client wrapper that calls OpenAI chat completions with tool support and returns detailed audit entries,
 * including timing for each tool invocation.
 */
export class OpenAIAuditClient {
  private openai: OpenAI;
  private model: string;
  private client: Client;
  private availableTools: OpenAI.Chat.ChatCompletionTool[] = [];

  constructor(settings: AuditClientSettings) {
    const { apiKey, model } = settings;
    this.openai = new OpenAI({ apiKey });
    this.model = model;
    this.client = new Client({ name: 'node_js_sandbox', version: '1.0.0' });
  }

  /**
   * Initializes the sandbox client by launching the Docker-based MCP server and loading available tools.
   */
  public async initializeClient() {
    const userOutputDir = process.env.FILES_DIR;
    await this.client.connect(
      new StdioClientTransport({
        command: 'docker',
        args: [
          'run',
          '-i',
          '--rm',
          '-v',
          '/var/run/docker.sock:/var/run/docker.sock',
          '-v',
          `${userOutputDir}:/root`,
          '-e',
          `FILES_DIR=${userOutputDir}`,
          'alfonsograziano/node-code-sandbox-mcp',
        ],
      })
    );

    const { tools } = await this.client.listTools();
    this.availableTools = tools.map((tool) => ({
      type: 'function',
      function: {
        parameters: tool.inputSchema,
        ...tool,
      },
    }));
  }

  /**
   * Call OpenAI's chat completions with automatic tool usage.
   * Returns the sequence of messages, responses, and timing details for each tool invocation.
   * @param requestOptions - Includes messages to send
   */
  public async chat(
    requestOptions: Omit<OpenAI.Chat.ChatCompletionCreateParams, 'model'>
  ): Promise<{
    responses: OpenAI.Chat.Completions.ChatCompletion[];
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
    toolRuns: Array<{
      toolName: string;
      toolCallId: string;
      params: unknown;
      durationMs: number;
    }>;
  }> {
    const messages = [...requestOptions.messages];
    const responses: OpenAI.Chat.Completions.ChatCompletion[] = [];
    const toolRuns: Array<{
      toolName: string;
      toolCallId: string;
      params: unknown;
      durationMs: number;
    }> = [];
    let interactionCount = 0;
    const maxInteractions = 10;

    while (interactionCount++ < maxInteractions) {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages,
        tools: this.availableTools,
        tool_choice: 'auto',
      });
      responses.push(response);
      const message = response.choices[0].message;
      messages.push(message);

      if (message.tool_calls) {
        for (const toolCall of message.tool_calls) {
          const functionName = toolCall.function.name;
          const params = JSON.parse(toolCall.function.arguments || '{}');
          const start = Date.now();
          const result = await this.client.callTool({
            name: functionName,
            arguments: params,
          });
          const durationMs = Date.now() - start;

          // record tool invocation details
          toolRuns.push({
            toolName: functionName,
            toolCallId: toolCall.id,
            params,
            durationMs,
          });

          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(result),
          });
        }
      } else {
        break;
      }
    }

    return { responses, messages, toolRuns };
  }

  /**
   * Exposes the list of available tools for inspection.
   */
  public getAvailableTools() {
    return this.availableTools;
  }
}
