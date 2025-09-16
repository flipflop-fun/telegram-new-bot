import { DatabaseService } from '../services/database';
import { TelegramService } from '../services/telegram';
import { logger } from './logger';

export class HealthChecker {
  private databaseService: DatabaseService;
  private telegramService: TelegramService;
  private lastHealthCheck: Date = new Date();
  private healthCheckInterval: number = 60000; // 1 minute

  constructor(databaseService: DatabaseService, telegramService: TelegramService) {
    this.databaseService = databaseService;
    this.telegramService = telegramService;
  }

  async performHealthCheck(): Promise<boolean> {
    try {
      logger.info('Performing health check...');
      
      const dbHealthy = await this.databaseService.testConnection();
      const telegramHealthy = await this.telegramService.testConnection();
      
      const isHealthy = dbHealthy && telegramHealthy;
      
      if (isHealthy) {
        logger.info('Health check passed');
        this.lastHealthCheck = new Date();
      } else {
        logger.error(`Health check failed - DB: ${dbHealthy}, Telegram: ${telegramHealthy}`);
      }
      
      return isHealthy;
    } catch (error) {
      logger.error('Health check error:', error);
      return false;
    }
  }

  getLastHealthCheck(): Date {
    return this.lastHealthCheck;
  }

  isHealthCheckStale(): boolean {
    const now = new Date();
    const timeDiff = now.getTime() - this.lastHealthCheck.getTime();
    return timeDiff > this.healthCheckInterval * 2; // Consider stale if 2x interval
  }
}