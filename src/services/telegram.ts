import TelegramBot from 'node-telegram-bot-api';
import { TelegramConfig, InitializeTokenEventEntity } from '../types';
import { logger } from '../utils/logger';

export class TelegramService {
  private bot: TelegramBot;
  private chatIds: string[];

  constructor(config: TelegramConfig) {
    this.bot = new TelegramBot(config.botToken, { polling: false });
    this.chatIds = config.chatIds;
  }

  async sendNewTokenNotification(entity: InitializeTokenEventEntity): Promise<void> {
    const message = this.formatTokenMessage(entity);
    const sendPromises = this.chatIds.map(async (chatId) => {
      try {
        await this.bot.sendMessage(chatId, message, { 
          parse_mode: 'HTML',
          disable_web_page_preview: true 
        });
        logger.info(`Sent notification to chat ${chatId} for token: ${entity.token_name || entity.token_symbol || entity.mint}`);
      } catch (error) {
        logger.error(`Failed to send message to chat ${chatId}:`, error);
        // Don't throw here, continue sending to other chats
      }
    });

    try {
      await Promise.allSettled(sendPromises);
      logger.info(`Notification sent to ${this.chatIds.length} chat(s) for token: ${entity.token_name || entity.token_symbol || entity.mint}`);
    } catch (error) {
      logger.error('Unexpected error in sendNewTokenNotification:', error);
      throw error;
    }
  }

  private formatTokenMessage(entity: InitializeTokenEventEntity): string {
    const tokenName = entity.token_name || 'Unknown';
    const tokenSymbol = entity.token_symbol || 'N/A';
    const timestamp = new Date(entity.timestamp * 1000).toLocaleString();
    
    return `
🚀 <b>New Token Initialized!</b>

📊 <b>Token Info:</b>
• Name: ${tokenName}
• Symbol: ${tokenSymbol}
• Mint: <code>${entity.mint}</code>
• Supply: ${this.formatNumber(entity.supply)}

⛓️ <b>Blockchain Info:</b>
• Block Height: ${entity.block_height}
• Transaction: <code>${entity.tx_id}</code>
• Timestamp: ${timestamp}

💰 <b>Economics:</b>
• Total Tokens: ${this.formatNumber(entity.total_tokens)}
• Total Mint Fee: ${this.formatNumber(entity.total_mint_fee)}
• Fee Rate: ${(entity.fee_rate * 100).toFixed(2)}%
• Status: ${this.getStatusText(entity.status)}

🔗 <b>Accounts:</b>
• Admin: <code>${entity.admin}</code>
• Config: <code>${entity.config_account}</code>
• Token Vault: <code>${entity.token_vault}</code>

📈 <b>Current Epoch:</b>
• Era: ${entity.current_era}
• Epoch: ${entity.current_epoch}
• Mint Size: ${this.formatNumber(entity.mint_size_epoch)}
• Quantity Minted: ${this.formatNumber(entity.quantity_minted_epoch)}

${entity.token_uri ? `🔗 Metadata: ${entity.token_uri}` : ''}
    `.trim();
  }

  private formatNumber(num: number): string {
    if (num >= 1e9) {
      return (num / 1e9).toFixed(2) + 'B';
    } else if (num >= 1e6) {
      return (num / 1e6).toFixed(2) + 'M';
    } else if (num >= 1e3) {
      return (num / 1e3).toFixed(2) + 'K';
    }
    return num.toLocaleString();
  }

  private getStatusText(status: number): string {
    switch (status) {
      case 0: return '🟡 Initialized';
      case 1: return '🟢 Active';
      case 2: return '🔴 Paused';
      case 3: return '⚫ Ended';
      default: return `Unknown (${status})`;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const me = await this.bot.getMe();
      logger.info(`Telegram bot connected: @${me.username}`);
      return true;
    } catch (error) {
      logger.error('Telegram bot connection test failed:', error);
      return false;
    }
  }

  async sendTestMessage(): Promise<void> {
    const testMessage = '🤖 Telegram News Bot is online and ready!';
    const sendPromises = this.chatIds.map(async (chatId) => {
      try {
        await this.bot.sendMessage(chatId, testMessage);
        logger.info(`Test message sent successfully to chat ${chatId}`);
      } catch (error) {
        logger.error(`Failed to send test message to chat ${chatId}:`, error);
        // Don't throw here, continue sending to other chats
      }
    });

    try {
      await Promise.allSettled(sendPromises);
      logger.info(`Test message sent to ${this.chatIds.length} chat(s)`);
    } catch (error) {
      logger.error('Unexpected error in sendTestMessage:', error);
      throw error;
    }
  }
}