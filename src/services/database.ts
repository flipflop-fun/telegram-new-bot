import { Pool, PoolClient } from 'pg';
import { DatabaseConfig, InitializeTokenEventEntity } from '../types';
import { logger } from '../utils/logger';

export class DatabaseService {
  private pool: Pool;
  private lastCheckedVid: number = 0;

  constructor(config: DatabaseConfig) {
    this.pool = new Pool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      ssl: config.ssl ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.pool.on('error', (err) => {
      logger.error('Unexpected error on idle client', err);
    });
  }

  async connect(): Promise<void> {
    try {
      const client = await this.pool.connect();
      logger.info('Connected to PostgreSQL database');
      
      // Initialize lastCheckedVid with the current maximum vid
      await this.initializeLastCheckedVid(client);
      client.release();
    } catch (error) {
      logger.error('Failed to connect to database:', error);
      throw error;
    }
  }

  private async initializeLastCheckedVid(client: PoolClient): Promise<void> {
    try {
      const result = await client.query(
        'SELECT COALESCE(MAX(vid), 0) as max_vid FROM initialize_token_event_entity'
      );
      this.lastCheckedVid = result.rows[0].max_vid;
      logger.info(`Initialized lastCheckedVid to: ${this.lastCheckedVid}`);
    } catch (error) {
      logger.error('Failed to initialize lastCheckedVid:', error);
      this.lastCheckedVid = 0;
    }
  }

  async checkForNewRecords(): Promise<InitializeTokenEventEntity[]> {
    const client = await this.pool.connect();
    try {
      const query = `
        SELECT * FROM initialize_token_event_entity 
        WHERE vid > $1 
        ORDER BY vid ASC
      `;
      
      const result = await client.query(query, [this.lastCheckedVid]);
      
      if (result.rows.length > 0) {
        const newRecords = result.rows.map(row => this.mapRowToEntity(row));
        
        // Update lastCheckedVid to the highest vid from the new records
        const maxVid = Math.max(...newRecords.map(record => record.vid));
        this.lastCheckedVid = maxVid;
        
        logger.info(`Found ${newRecords.length} new records. Updated lastCheckedVid to: ${maxVid}`);
        return newRecords;
      }
      
      return [];
    } catch (error) {
      logger.error('Error checking for new records:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  private mapRowToEntity(row: any): InitializeTokenEventEntity {
    return {
      vid: parseInt(row.vid),
      block_height: parseFloat(row.block_height),
      id: row.id,
      tx_id: row.tx_id,
      admin: row.admin,
      token_id: parseFloat(row.token_id),
      mint: row.mint,
      config_account: row.config_account,
      metadata_account: row.metadata_account,
      token_vault: row.token_vault,
      timestamp: parseFloat(row.timestamp),
      start_timestamp: parseFloat(row.start_timestamp),
      metadata_timestamp: parseFloat(row.metadata_timestamp),
      value_manager: row.value_manager,
      wsol_vault: row.wsol_vault,
      token_name: row.token_name,
      token_symbol: row.token_symbol,
      token_uri: row.token_uri,
      supply: parseFloat(row.supply),
      current_era: parseFloat(row.current_era),
      current_epoch: parseFloat(row.current_epoch),
      elapsed_seconds_epoch: parseFloat(row.elapsed_seconds_epoch),
      start_timestamp_epoch: parseFloat(row.start_timestamp_epoch),
      last_difficulty_coefficient_epoch: parseFloat(row.last_difficulty_coefficient_epoch),
      difficulty_coefficient_epoch: parseFloat(row.difficulty_coefficient_epoch),
      mint_size_epoch: parseFloat(row.mint_size_epoch),
      quantity_minted_epoch: parseFloat(row.quantity_minted_epoch),
      target_mint_size_epoch: parseFloat(row.target_mint_size_epoch),
      total_mint_fee: parseFloat(row.total_mint_fee),
      total_referrer_fee: parseFloat(row.total_referrer_fee),
      total_tokens: parseFloat(row.total_tokens),
      graduate_epoch: parseFloat(row.graduate_epoch),
      target_eras: row.target_eras ? parseFloat(row.target_eras) : undefined,
      epoches_per_era: row.epoches_per_era ? parseFloat(row.epoches_per_era) : undefined,
      target_seconds_per_epoch: parseFloat(row.target_seconds_per_epoch),
      reduce_ratio: parseFloat(row.reduce_ratio),
      initial_mint_size: parseFloat(row.initial_mint_size),
      initial_target_mint_size_per_epoch: parseFloat(row.initial_target_mint_size_per_epoch),
      fee_rate: parseFloat(row.fee_rate),
      liquidity_tokens_ratio: parseFloat(row.liquidity_tokens_ratio),
      status: parseInt(row.status)
    };
  }

  async disconnect(): Promise<void> {
    await this.pool.end();
    logger.info('Disconnected from PostgreSQL database');
  }

  async testConnection(): Promise<boolean> {
    try {
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      client.release();
      return true;
    } catch (error) {
      logger.error('Database connection test failed:', error);
      return false;
    }
  }
}