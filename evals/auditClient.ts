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

    // Ensure the log directory exists
    const dir = path.dirname(this.logFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Initialize log file if not present
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
   * Call OpenAI's chat completions endpoint and log the full audit.
   * @param requestOptions - same structure as ChatCompletionRequest
   */
  public async chat(
    requestOptions: Omit<OpenAI.Chat.ChatCompletionCreateParams, "model">
  ): Promise<OpenAI.Chat.ChatCompletion> {
    const timestamp = new Date().toISOString();
    const payload: OpenAI.Chat.ChatCompletionCreateParams = {
      model: this.model,
      tools: this.availableTools,
      ...requestOptions,
    };

    // Call OpenAI
    const response = await this.openai.chat.completions.create(payload);

    let finalResponse: OpenAI.Chat.ChatCompletion;
    if ("choices" in response) {
      finalResponse = response as OpenAI.Chat.ChatCompletion;
    } else {
      throw new Error(
        "Streaming responses are not supported in this implementation."
      );
    }

    // Prepare audit entry
    const auditEntry = {
      timestamp,
      request: payload,
      response: finalResponse,
    };

    // Append to log file
    fs.appendFileSync(
      this.logFilePath,
      JSON.stringify(auditEntry, null, 2) + "\n",
      { encoding: "utf8" }
    );

    return finalResponse;
  }

  public getAvailableTools() {
    return this.availableTools;
  }
}
