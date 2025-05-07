import { z } from 'zod';

const DEFAULT_TIMEOUT_SECONDS = 3600;
const DEFAULT_RUN_SCRIPT_TIMEOUT = 30_000;

const envSchema = z.object({
  NODE_CONTAINER_TIMEOUT: z.string().optional(),
  RUN_SCRIPT_TIMEOUT: z.string().optional(),
  SANDBOX_MEMORY_LIMIT: z
    .string()
    .regex(/^\d+(\.\d+)?[mMgG]?$/, {
      message: 'SANDBOX_MEMORY_LIMIT must be like "512m", "1g", or bytes',
    })
    .optional()
    .nullable(),
  SANDBOX_CPU_LIMIT: z
    .string()
    .regex(/^\d+(\.\d+)?$/, {
      message: 'SANDBOX_CPU_LIMIT must be numeric (e.g. "0.5", "2")',
    })
    .optional()
    .nullable(),
});

// Schema for the final config object with transformations and defaults
const configSchema = z.object({
  containerTimeoutSeconds: z.number().positive(),
  containerTimeoutMilliseconds: z.number().positive(),
  runScriptTimeoutMilliseconds: z.number().positive(),
  rawMemoryLimit: z.string().optional(),
  rawCpuLimit: z.string().optional(),
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
  const memRaw = parsedEnv.data.SANDBOX_MEMORY_LIMIT;
  const cpuRaw = parsedEnv.data.SANDBOX_CPU_LIMIT;

  return configSchema.parse({
    containerTimeoutSeconds: seconds,
    containerTimeoutMilliseconds: milliseconds,
    runScriptTimeoutMilliseconds: runScriptTimeoutMilliseconds,
    rawMemoryLimit: memRaw,
    rawCpuLimit: cpuRaw,
  });
}

export const getConfig = loadConfig;
