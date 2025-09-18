import TelegramBot from 'node-telegram-bot-api';
import { TelegramConfig, InitializeTokenEventEntity } from '../types';
import { logger } from '../utils/logger';

interface TokenMetadata {
  name?: string;
  symbol?: string;
  description?: string;
  image?: string;
  extensions?: {
    website?: string;
    twitter?: string;
    discord?: string;
    telegram?: string;
    github?: string;
    medium?: string;
  };
}

export class TelegramService {
  private bot: TelegramBot;
  private chatIds: string[];

  constructor(config: TelegramConfig) {
    this.bot = new TelegramBot(config.botToken, { polling: false });
    this.chatIds = config.chatIds;
  }

  async sendNewTokenNotification(entity: InitializeTokenEventEntity): Promise<void> {
    const metadata = entity.token_uri ? await this.fetchTokenMetadata(entity.token_uri) : null;
    
    const sendPromises = this.chatIds.map(async (chatId) => {
      try {
        if (metadata?.image) {
          const caption = this.formatTokenMessage(entity, metadata);
          await this.bot.sendPhoto(chatId, metadata.image, {
            caption,
            parse_mode: 'HTML'
          });
        } else {
          const message = this.formatTokenMessage(entity, metadata);
          await this.bot.sendMessage(chatId, message, { 
            parse_mode: 'HTML',
            disable_web_page_preview: true 
          });
        }
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

  private async fetchTokenMetadata(tokenUri: string): Promise<TokenMetadata | null> {
    try {
      if (!tokenUri) {
        logger.warn('Token URI is empty');
        return null;
      }

      const response = await fetch(tokenUri);
      if (!response.ok) {
        logger.warn(`Failed to fetch token metadata from ${tokenUri}: ${response.status}`);
        return null;
      }

      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.startsWith('image/')) {
        logger.info(`Token URI is a direct image: ${tokenUri}`);
        return {
          image: tokenUri
        };
      }

      try {
        const metadata = await response.json() as TokenMetadata;
        logger.info(`Successfully fetched metadata for token: ${metadata.name || 'Unknown'}`);
        return metadata;
      } catch (jsonError) {
        logger.warn(`Failed to parse JSON from ${tokenUri}, treating as direct image URL`);
        return {
          image: tokenUri
        };
      }
    } catch (error) {
      logger.error(`Error fetching token metadata from ${tokenUri}:`, error);
      return null;
    }
  }

  private formatTokenMessage(entity: InitializeTokenEventEntity, metadata?: TokenMetadata | null): string {
    const tokenName = metadata?.name || entity.token_name || 'Unknown';
    const tokenSymbol = metadata?.symbol || entity.token_symbol || 'N/A';
    const description = metadata?.description;
    const timestamp = new Date(entity.timestamp * 1000).toLocaleString();
    
    let message = `🚀 <b>New Token Initialized!</b>

📊 <b>Token Info:</b>
• Name: ${tokenName}
• Symbol: ${tokenSymbol}
• Mint: <code>${entity.mint}</code>`;

    if (description && description.trim()) {
      message += `\n• Description: ${description}`;
    }

    message += `\n\n⛓️ <b>Blockchain Info:</b>
• Block Height: ${entity.block_height}
• Transaction: <code>${entity.tx_id}</code>
• Timestamp: ${timestamp}
• Fee Rate: ${(entity.fee_rate / 1e9).toFixed(2)} SOL
• Admin: <code>${entity.admin}</code>
• Mint Size: ${this.formatNumber(entity.mint_size_epoch / 1e9)}`;

    if (metadata?.extensions) {
      const links = [];
      if (metadata.extensions.website) links.push(`🌐 <a href="${metadata.extensions.website}">Website</a>`);
      if (metadata.extensions.twitter) links.push(`🐦 <a href="${metadata.extensions.twitter}">Twitter</a>`);
      if (metadata.extensions.telegram) links.push(`📱 <a href="${metadata.extensions.telegram}">Telegram</a>`);
      if (metadata.extensions.discord) links.push(`💬 <a href="${metadata.extensions.discord}">Discord</a>`);
      if (metadata.extensions.github) links.push(`💻 <a href="${metadata.extensions.github}">GitHub</a>`);
      if (metadata.extensions.medium) links.push(`📝 <a href="${metadata.extensions.medium}">Medium</a>`);
      
      if (links.length > 0) {
        message += `\n\n🔗 <b>Links:</b>\n${links.join('\n')}`;
      }
    }

    if (entity.token_uri && !metadata) {
      message += `\n\n🔗 Metadata: ${entity.token_uri}`;
    }

    return message.trim();
  }

  private formatNumber(num: number): string {
    // if (num >= 1e9) {
    //   return (num / 1e9).toFixed(2) + 'B';
    // } else if (num >= 1e6) {
    //   return (num / 1e6).toFixed(2) + 'M';
    // } else if (num >= 1e3) {
    //   return (num / 1e3).toFixed(2) + 'K';
    // }
    return num.toLocaleString();
  }

  // private getStatusText(status: number): string {
  //   switch (status) {
  //     case 0: return '🟡 Initialized';
  //     case 1: return '🟢 Active';
  //     case 2: return '🔴 Paused';
  //     case 3: return '⚫ Ended';
  //     default: return `Unknown (${status})`;
  //   }
  // }

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