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
console.log(client.getAvailableTools());

await client.chat({
  messages: [
    {
      role: "user",
      content: `Create and run a JavaScript script that defines a complex regular expression to match valid mathematical expressions containing nested parentheses (e.g., ((2+3)_(4-5))), allowing numbers, +, -, _, / operators, and properly nested parentheses.

Requirements:

- The regular expression must handle deep nesting (e.g., up - to 3-4 levels).
- Write at least 10 unit tests covering correct and - incorrect cases.
- Use assert or manually throw errors if the validation fails.
- Add a short comment explaining the structure of the regex.`,
    },
  ],
});

process.exit(0);
