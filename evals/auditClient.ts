import { OpenAI } from "openai";
import fs from "fs";
import path from "path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

/**
 * Settings for the OpenAIAuditClient
 */
export interface AuditClientSettings {
  apiKey?: string; // OpenAI API key
  model: string; // Model to use for chat completions
  logFilePath: string; // File path where audit logs will be written
}

/**
 * A client wrapper that calls OpenAI chat completions and logs each interaction.
 */
export class OpenAIAuditClient {
  private openai: OpenAI;
  private model: string;
  // This should be a jsonl file with each line being a JSON object
  // representing a single audit entry.
  private logFilePath: string;
  private client: Client;
  private availableTools: OpenAI.Chat.ChatCompletionTool[];

  constructor(settings: AuditClientSettings) {
    const { apiKey, model, logFilePath } = settings;
    this.openai = new OpenAI({ apiKey });
    this.model = model;
    this.logFilePath = path.resolve(logFilePath);
    this.client = new Client({ name: "node_js_sandbox", version: "1.0.0" });

    const dir = path.dirname(this.logFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(this.logFilePath)) {
      fs.writeFileSync(this.logFilePath, "", { encoding: "utf8" });
    }
  }

  public async initializeClient() {
    const userOutputDir = process.env.JS_SANDBOX_OUTPUT_DIR;
    await this.client.connect(
      new StdioClientTransport({
        command: "docker",
        args: [
          "run",
          "-i",
          "--rm",
          "-v",
          "/var/run/docker.sock:/var/run/docker.sock",
          "-v",
          `${userOutputDir}:/root`,
          "-e",
          `JS_SANDBOX_OUTPUT_DIR=${userOutputDir}`,
          "alfonsograziano/node-code-sandbox-mcp",
        ],
      })
    );

    const { tools } = await this.client.listTools();
    this.availableTools = tools.map((tool) => ({
      type: "function",
      function: {
        parameters: tool.inputSchema,
        ...tool,
      },
    }));
  }

  /**
   * Call OpenAI's chat completions endpoint and log the full audit, supporting auto tool usage.
   * @param requestOptions - same structure as ChatCompletionRequest
   */
  public async chat(
    requestOptions: Omit<OpenAI.Chat.ChatCompletionCreateParams, "model">
  ): Promise<OpenAI.Chat.ChatCompletionMessage> {
    const messages = [...requestOptions.messages];
    const timestamp = new Date().toISOString();
    let interactionCount = 0;
    const maxInteractions = 10;

    while (interactionCount++ < maxInteractions) {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages,
        tools: this.availableTools,
        tool_choice: "auto",
      });

      const message = response.choices[0].message;
      messages.push(message);

      if (message.tool_calls) {
        for (const toolCall of message.tool_calls) {
          const functionName = toolCall.function.name;
          const args = JSON.parse(toolCall.function.arguments || "{}");

          const result = await this.client.callTool({
            name: functionName,
            arguments: args,
          });

          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(result),
          });
        }
      } else {
        const auditEntry = {
          timestamp,
          request: {
            model: this.model,
            messages: requestOptions.messages,
            tools: this.availableTools,
          },
          response: messages,
        };

        fs.appendFileSync(
          this.logFilePath,
          JSON.stringify(auditEntry, null, 2) + "\n",
          { encoding: "utf8" }
        );

        return message;
      }
    }

    throw new Error(
      "Max interaction count exceeded without reaching final answer."
    );
  }

  public getAvailableTools() {
    return this.availableTools;
  }
}
