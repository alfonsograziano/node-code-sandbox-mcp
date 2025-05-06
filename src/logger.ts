import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

// Will be set once the server is initialized
let serverInstance: McpServer | null = null;

/**
 * Set the server instance for logging
 * @param server MCP server instance
 */
export function setServerInstance(server: McpServer): void {
  serverInstance = server;
}

/**
 * Log levels supported by MCP
 */
export type LogLevel = 'debug' | 'info' | 'warning' | 'error';

/**
 * Send a logging message using the MCP protocol
 * Falls back to console.error if server is not initialized
 * @param level Log level
 * @param message Message to log
 * @param data Optional data to include
 */
export function log(level: LogLevel, message: string, data?: unknown): void {
  if (serverInstance) {
    // Access the server through the internal server property
    // @ts-expect-error - _server is not documented in the public API but is available
    const internalServer = serverInstance._server;
    if (
      internalServer &&
      typeof internalServer.sendLoggingMessage === 'function'
    ) {
      internalServer.sendLoggingMessage({
        level,
        data: data ? `${message}: ${JSON.stringify(data)}` : message,
      });
      return;
    }
  }

  // Fallback if server is not initialized yet or doesn't support logging
  console.error(`[${level.toUpperCase()}] ${message}`, data || '');
}

/**
 * Convenience methods for different log levels
 */
export const logger = {
  debug: (message: string, data?: unknown) => log('debug', message, data),
  info: (message: string, data?: unknown) => log('info', message, data),
  warning: (message: string, data?: unknown) => log('warning', message, data),
  error: (message: string, data?: unknown) => log('error', message, data),
};
