export interface InitializeTokenEventEntity {
  vid: number;
  block_height: number;
  id: string;
  tx_id: string;
  admin: string;
  token_id: number;
  mint: string;
  config_account: string;
  metadata_account: string;
  token_vault: string;
  timestamp: number;
  start_timestamp: number;
  metadata_timestamp: number;
  value_manager: string;
  wsol_vault: string;
  token_name?: string;
  token_symbol?: string;
  token_uri?: string;
  supply: number;
  current_era: number;
  current_epoch: number;
  elapsed_seconds_epoch: number;
  start_timestamp_epoch: number;
  last_difficulty_coefficient_epoch: number;
  difficulty_coefficient_epoch: number;
  mint_size_epoch: number;
  quantity_minted_epoch: number;
  target_mint_size_epoch: number;
  total_mint_fee: number;
  total_referrer_fee: number;
  total_tokens: number;
  graduate_epoch: number;
  target_eras?: number;
  epoches_per_era?: number;
  target_seconds_per_epoch: number;
  reduce_ratio: number;
  initial_mint_size: number;
  initial_target_mint_size_per_epoch: number;
  fee_rate: number;
  liquidity_tokens_ratio: number;
  status: number;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl?: boolean;
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
}

export interface AppConfig {
  database: DatabaseConfig;
  telegram: TelegramConfig;
  pollInterval: number;
}