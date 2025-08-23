#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { OpenAIAuditClient } from './auditClient.ts';

dotenv.config();

/**
 * evalRunner Configuration
 *
 * - evalsPath:   Path to a JSON file containing an array of eval definitions {
 *                   id: string,
 *                   prompt: string
 *               }
 * - batchSize:   Number of evals to process per batch.
 * - outputPath:  Path to write results in JSONL format.
 */
const config = {
  evalsPath: './evals/basicEvals.json',
  batchSize: 5,
  outputPath: './evalResults.jsonl',
};

async function run() {
  const { evalsPath, batchSize, outputPath } = config;

  // Load eval definitions
  if (!fs.existsSync(evalsPath)) {
    console.error(`Evals file not found at ${evalsPath}`);
    process.exit(1);
  }
  const evals = JSON.parse(fs.readFileSync(evalsPath, 'utf-8'));
  if (!Array.isArray(evals)) {
    console.error('Evals file must export an array of {id, prompt} objects.');
    process.exit(1);
  }

  // Initialize OpenAI Audit Client
  const client = new OpenAIAuditClient({
    apiKey: process.env.OPENAI_API_KEY!,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  });
  await client.initializeClient();
  console.log('OpenAI Audit Client initialized');

  // Ensure output directory exists
  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // Process in batches
  for (let i = 0; i < evals.length; i += batchSize) {
    const batch = evals.slice(i, i + batchSize);
    console.log(
      `Processing batch ${i / batchSize + 1} (${batch.length} evals)...`
    );

    const promises = batch.map(async ({ id, prompt }) => {
      const startTimeInMillis = new Date().getTime();
      const startHumanRadableTime = new Date().toISOString();
      try {
        const fullResponse = await client.chat({
          messages: [{ role: 'user', content: prompt }],
        });
        const endTimeInMillis = new Date().getTime();
        const endHumanRadableTime = new Date().toISOString();
        const durationInMillis = endTimeInMillis - startTimeInMillis;
        const humanRadableDuration = `${startHumanRadableTime} - ${endHumanRadableTime}`;

        return {
          id,
          fullResponse,
          timing: {
            startTimeInMillis,
            endTimeInMillis,
            startHumanRadableTime,
            endHumanRadableTime,
            durationInMillis,
            humanRadableDuration,
          },
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : `Unknown error: ${err}`;
        return { id, prompt, error: errorMessage };
      }
    });

    const results = await Promise.all(promises);

    // Append each result as a JSON line
    for (const result of results) {
      fs.appendFileSync(outputPath, JSON.stringify(result, null, 2) + '\n');
    }
    console.log(`Batch ${i / batchSize + 1} done.`);
  }

  console.log('All evals processed. Results saved to', config.outputPath);
}

run().catch((err) => {
  console.error('Error running evalRunner:', err);
  process.exit(1);
});
