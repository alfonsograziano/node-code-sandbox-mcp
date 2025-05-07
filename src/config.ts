import { z } from 'zod';

const DEFAULT_TIMEOUT_SECONDS = 3600;
const DEFAULT_RUN_SCRIPT_TIMEOUT = 30_000;

const envSchema = z.object({
  NODE_CONTAINER_TIMEOUT: z.string().optional(),
  RUN_SCRIPT_TIMEOUT: z.string().optional(),
});

// Schema for the final config object with transformations and defaults
const configSchema = z.object({
  containerTimeoutSeconds: z.number().positive(),
  containerTimeoutMilliseconds: z.number().positive(),
  runScriptTimeoutMilliseconds: z.number().positive(),
});

function loadConfig() {
  const parsedEnv = envSchema.safeParse(process.env);

  if (!parsedEnv.success) {
    throw new Error('Invalid environment variables');
  }

  const timeoutString = parsedEnv.data.NODE_CONTAINER_TIMEOUT;
  let seconds = DEFAULT_TIMEOUT_SECONDS;

  if (timeoutString) {
    const parsedSeconds = parseInt(timeoutString, 10);
    if (!isNaN(parsedSeconds) && parsedSeconds > 0) {
      seconds = parsedSeconds;
    }
  }

  const runScriptTimeoutMillisecondsString = parsedEnv.data.RUN_SCRIPT_TIMEOUT;
  let runScriptTimeoutMilliseconds = DEFAULT_RUN_SCRIPT_TIMEOUT;

  if (runScriptTimeoutMillisecondsString) {
    const parsedSeconds = parseInt(runScriptTimeoutMillisecondsString, 10);
    if (!isNaN(parsedSeconds) && parsedSeconds > 0) {
      runScriptTimeoutMilliseconds = parsedSeconds;
    }
  }

  const milliseconds = seconds * 1000;

  return configSchema.parse({
    containerTimeoutSeconds: seconds,
    containerTimeoutMilliseconds: milliseconds,
    runScriptTimeoutMilliseconds: runScriptTimeoutMilliseconds,
  });
}

export const getConfig = loadConfig;
