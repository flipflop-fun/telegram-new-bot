import { DatabaseService } from './services/database';
import { TelegramService } from './services/telegram';
import { config, validateConfig } from './utils/config';
import { logger } from './utils/logger';
import { InitializeTokenEventEntity } from './types';

class TelegramNewsBot {
  private databaseService: DatabaseService;
  private telegramService: TelegramService;
  private isRunning: boolean = false;
  private pollInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.databaseService = new DatabaseService(config.database);
    this.telegramService = new TelegramService(config.telegram);
  }

  async start(): Promise<void> {
    try {
      logger.info('Starting Telegram News Bot...');
      
      // Validate configuration
      validateConfig();
      logger.info('Configuration validated successfully');

      // Test connections
      await this.testConnections();

      // Connect to database
      await this.databaseService.connect();

      // Send startup notification
      await this.telegramService.sendTestMessage();

      // Start monitoring
      this.startMonitoring();

      logger.info(`Bot started successfully. Monitoring every ${config.pollInterval}ms`);
    } catch (error) {
      logger.error('Failed to start bot:', error);
      throw error;
    }
  }

  private async testConnections(): Promise<void> {
    logger.info('Testing connections...');
    
    const dbConnected = await this.databaseService.testConnection();
    if (!dbConnected) {
      throw new Error('Database connection test failed');
    }
    logger.info('Database connection test passed');

    const telegramConnected = await this.telegramService.testConnection();
    if (!telegramConnected) {
      throw new Error('Telegram bot connection test failed');
    }
    logger.info('Telegram bot connection test passed');
  }

  private startMonitoring(): void {
    this.isRunning = true;
    
    const monitor = async () => {
      if (!this.isRunning) return;

      try {
        const newRecords = await this.databaseService.checkForNewRecords();
        
        if (newRecords.length > 0) {
          logger.info(`Processing ${newRecords.length} new records`);
          
          for (const record of newRecords) {
            await this.processNewRecord(record);
            // Add small delay between messages to avoid rate limiting
            await this.sleep(1000);
          }
        }
      } catch (error) {
        logger.error('Error during monitoring:', error);
      }

      // Schedule next check
      if (this.isRunning) {
        this.pollInterval = setTimeout(monitor, config.pollInterval);
      }
    };

    // Start monitoring immediately
    monitor();
  }

  private async processNewRecord(record: InitializeTokenEventEntity): Promise<void> {
    try {
      await this.telegramService.sendNewTokenNotification(record);
      logger.info(`Processed record vid: ${record.vid}, token: ${record.token_name || record.mint}`);
    } catch (error) {
      logger.error(`Failed to process record vid: ${record.vid}`, error);
      // Continue processing other records even if one fails
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async stop(): Promise<void> {
    logger.info('Stopping Telegram News Bot...');
    
    this.isRunning = false;
    
    if (this.pollInterval) {
      clearTimeout(this.pollInterval);
      this.pollInterval = null;
    }

    await this.databaseService.disconnect();
    
    logger.info('Bot stopped successfully');
  }
}

// Handle graceful shutdown
const bot = new TelegramNewsBot();

process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  await bot.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  await bot.stop();
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the bot
bot.start().catch((error) => {
  logger.error('Failed to start bot:', error);
  process.exit(1);
});