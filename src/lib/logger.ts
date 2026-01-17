type LogContext = Record<string, unknown>;

interface Logger {
  error: (message: string, context?: LogContext) => void;
  warn: (message: string, context?: LogContext) => void;
  info: (message: string, context?: LogContext) => void;
  debug: (message: string, context?: LogContext) => void;
}

const formatContext = (context?: LogContext): string => {
  if (!context) return '';
  try {
    return JSON.stringify(context, null, 2);
  } catch {
    return String(context);
  }
};

const isDevelopment = import.meta.env.DEV;

export const logger: Logger = {
  error: (message: string, context?: LogContext) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ERROR: ${message}`, context ? formatContext(context) : '');
  },

  warn: (message: string, context?: LogContext) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] WARN: ${message}`, context ? formatContext(context) : '');
  },

  info: (message: string, context?: LogContext) => {
    const timestamp = new Date().toISOString();
    console.info(`[${timestamp}] INFO: ${message}`, context ? formatContext(context) : '');
  },

  debug: (message: string, context?: LogContext) => {
    if (isDevelopment) {
      const timestamp = new Date().toISOString();
      console.debug(`[${timestamp}] DEBUG: ${message}`, context ? formatContext(context) : '');
    }
  }
};
