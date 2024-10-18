import { MigrationState } from './migration-state.data';

interface Asset {
  decimals?: number | null;
  has_nft_onchain_metadata?: boolean;
  quantity?: string;
  unit?: string;
}

interface BlockDetail {
  block_vrf?: string;
  confirmations?: number;
  epoch?: number;
  epoch_slot?: number;
  fees?: string;
  hash?: string;
  height?: number;
  next_block?: string;
  op_cert?: string;
  op_cert_counter?: string;
  output?: string;
  previous_block?: string;
  size?: number;
  slot?: number;
  slot_leader?: string;
  time?: number;
  tx_count?: number;
}

interface TransactionInfo {
  asset_mint_or_burn_count?: number;
  block?: string;
  block_height?: number;
  block_time?: number;
  delegation_count?: number;
  deposit?: string;
  fees?: string;
  hash?: string;
  index?: number;
  invalid_before?: null | string;
  invalid_hereafter?: string;
  mir_cert_count?: number;
  output_amount?: Array<{
    quantity?: string;
    unit?: string;
  }>;
  pool_retire_count?: number;
  pool_update_count?: number;
  redeemer_count?: number;
  size?: number;
  slot?: number;
  stake_cert_count?: number;
  utxo_count?: number;
  valid_contract?: boolean;
  withdrawal_count?: number;
}

interface Utxo {
  address?: string;
  amount?: Array<{
    quantity?: string;
    unit?: string;
  }>;
  collateral?: boolean;
  data_hash?: null | string;
  inline_datum?: null | string;
  output_index?: number;
  reference?: boolean;
  reference_script_hash?: null | string;
  tx_hash?: string;
}

interface TransactionUtxos {
  hash?: string;
  inputs?: Utxo[];
  outputs?: Utxo[];
}

interface HistoryDetail {
  block?: BlockDetail;
  info?: TransactionInfo;
  utxos?: TransactionUtxos;
}

interface TxHistory {
  confirmed?: string[];
  details?: Record<string, HistoryDetail>;
}

export interface NetworkInfo {
  assets?: Asset[];
  history?: TxHistory;
  lovelace?: string | null;
  minAda?: number | string;
  paymentAddr: string;
  rewardAddr?: string;
  collateral?: {
    lovelace?: string;
    txHash?: string;
    txId?: number;
  };
  lastUpdate?: string;
}

export interface Account {
  avatar?: string;
  index: number | string;
  mainnet: NetworkInfo;
  name: string;
  paymentKeyHash?: string;
  paymentKeyHashBech32?: string;
  preprod: NetworkInfo;
  preview: NetworkInfo;
  publicKey: string;
  stakeKeyHash?: string;
  testnet: NetworkInfo;
}

interface Migration {
  completed?: string[];
  version?: string;
}

interface Network {
  id?: string;
  node?: string;
}

export interface State {
  acceptedLegalDocsVersion?: number;
  accounts?: Record<string, Account>;
  analytics?: boolean;
  currency?: string;
  currentAccount?: string;
  encryptedKey: string;
  migration?: Migration;
  network?: Network;
  userId: string;
  whitelisted?: string[];
  laceMigration?: MigrationState;
  themeColor?: string;
}
