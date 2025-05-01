import { OpenAIAuditClient } from "./auditClient";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAIAuditClient({
  apiKey: process.env.OPENAI_API_KEY!,
  model: "gpt-4o-mini",
  logFilePath: "./logs/audit.jsonl",
});

await client.initializeClient();

console.log("Client initialized and connected to Docker container.");
// console.log(client.getAvailableTools());

await client.chat({
  messages: [
    {
      role: "user",
      content: `Create and run a simple Node.js script that prints "Hello, World!" to the console.`,
    },
  ],
});

console.log("Chat completed.");

process.exit(0);
