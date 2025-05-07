import { z } from 'zod';

const DEFAULT_TIMEOUT_SECONDS = 3600;

const envSchema = z.object({
  NODE_CONTAINER_TIMEOUT: z.string().optional(),
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
  rawMemoryLimit: z.string().optional(),
  rawCpuLimit: z.string().optional(),
});

function loadConfig() {
  const parsedEnv = envSchema.safeParse(process.env);

  if (!parsedEnv.success) {
    // console.error(
    //   '❌ Invalid environment variables:',
    //   parsedEnv.error.flatten().fieldErrors
    // );
    throw new Error('Invalid environment variables');
  }

  const timeoutString = parsedEnv.data.NODE_CONTAINER_TIMEOUT;
  let seconds = DEFAULT_TIMEOUT_SECONDS;

  if (timeoutString) {
    const parsedSeconds = parseInt(timeoutString, 10);
    if (!isNaN(parsedSeconds) && parsedSeconds > 0) {
      seconds = parsedSeconds;
    } else {
      // console.warn(
      //   `⚠️ Invalid NODE_CONTAINER_TIMEOUT value "${timeoutString}". Using default: ${DEFAULT_TIMEOUT_SECONDS}s`
      // );
    }
  }

  const milliseconds = seconds * 1000;
  const memRaw = parsedEnv.data.SANDBOX_MEMORY_LIMIT;
  const cpuRaw = parsedEnv.data.SANDBOX_CPU_LIMIT;

  try {
    return configSchema.parse({
      containerTimeoutSeconds: seconds,
      containerTimeoutMilliseconds: milliseconds,
      rawMemoryLimit: memRaw,
      rawCpuLimit: cpuRaw,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // console.error(
      //   '❌ Invalid derived config values:',
      //   error.flatten().fieldErrors
      // );
    }
    throw new Error('Failed to create valid config');
  }
}

export const config = loadConfig();
