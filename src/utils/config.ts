import dotenv from 'dotenv';
import { AppConfig } from '../types';

dotenv.config();

export const config: AppConfig = {
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'postgres',
    ssl: process.env.DB_SSLMODE === 'require'
  },
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    chatIds: process.env.TELEGRAM_CHAT_IDS 
      ? process.env.TELEGRAM_CHAT_IDS.split(',').map(id => id.trim())
      : []
  },
  pollInterval: parseInt(process.env.POLL_INTERVAL || '30000') // 30 seconds default
};

export function validateConfig(): void {
  const required = [
    'DB_HOST',
    'DB_PORT', 
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'TELEGRAM_BOT_TOKEN',
    'TELEGRAM_CHAT_IDS'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Additional validation for chat IDs
  if (config.telegram.chatIds.length === 0) {
    throw new Error('At least one chat ID must be provided in TELEGRAM_CHAT_IDS');
  }
}