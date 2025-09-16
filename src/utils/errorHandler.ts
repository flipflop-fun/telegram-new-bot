import { logger } from './logger';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super(`Database Error: ${message}`, 500);
  }
}

export class TelegramError extends AppError {
  constructor(message: string) {
    super(`Telegram Error: ${message}`, 500);
  }
}

export class ConfigurationError extends AppError {
  constructor(message: string) {
    super(`Configuration Error: ${message}`, 500);
  }
}

export function handleError(error: Error): void {
  logger.error('Application error:', {
    message: error.message,
    stack: error.stack,
    name: error.name
  });

  if (error instanceof AppError && !error.isOperational) {
    logger.error('Non-operational error detected, shutting down...');
    process.exit(1);
  }
}

export function createRetryWrapper<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  maxRetries: number = 3,
  delay: number = 1000
) {
  return async (...args: T): Promise<R> => {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn(...args);
      } catch (error) {
        lastError = error as Error;
        logger.warn(`Attempt ${attempt}/${maxRetries} failed:`, error);
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
      }
    }
    
    throw lastError!;
  };
}