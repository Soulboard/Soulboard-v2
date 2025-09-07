import { PublicKey, Connection, VersionedTransaction, Transaction } from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { SoulboardCore } from "@/types/soulboard_core";
import soulboardIdl from "@/idl/soulboard_core.json";

// Types for wallet operations
export interface WalletAdapter {
  address: string;
  sendTransaction: (params: { transaction: VersionedTransaction | Transaction }) => Promise<string>;
  signTransaction?: (transaction: VersionedTransaction | Transaction) => Promise<VersionedTransaction | Transaction>;
  signMessage?: (message: Uint8Array) => Promise<Uint8Array>;
}

// Simplified wallet interface for Anchor
export interface SoulboardWallet {
  publicKey: PublicKey;
  signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T>;
  signAllTransactions<T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]>;
}

/**
 * Creates a wallet adapter for Anchor from Crossmint wallet
 */
export function createSoulboardWallet(walletAdapter: WalletAdapter): SoulboardWallet {
  const publicKey = new PublicKey(walletAdapter.address);

  return {
    publicKey,
    signTransaction: async <T extends Transaction | VersionedTransaction>(tx: T): Promise<T> => {
      if (walletAdapter.signTransaction) {
        return walletAdapter.signTransaction(tx) as Promise<T>;
      }
      throw new Error("Wallet does not support transaction signing");
    },
    signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> => {
      if (walletAdapter.signTransaction) {
        const signedTxs = await Promise.all(
          txs.map(tx => walletAdapter.signTransaction!(tx))
        );
        return signedTxs as T[];
      }
      throw new Error("Wallet does not support transaction signing");
    },
  };
}

/**
 * Creates an Anchor provider from wallet adapter
 */
export function createAnchorProvider(
  walletAdapter: WalletAdapter,
  connection: Connection,
  opts = { commitment: 'confirmed' as const }
): AnchorProvider {
  const wallet = createSoulboardWallet(walletAdapter);
  return new AnchorProvider(connection, wallet as any, opts);
}

/**
 * Creates a Soulboard program instance
 */
export function createSoulboardProgram(
  provider: AnchorProvider,
  programId: PublicKey
): Program<SoulboardCore> {
  return new Program(soulboardIdl as SoulboardCore, provider);
}

/**
 * Service class for handling wallet and program operations
 */
export class ProviderService {
  private provider: AnchorProvider;
  private program: Program<SoulboardCore>;
  private walletAdapter: WalletAdapter;

  constructor(
    walletAdapter: WalletAdapter,
    connection: Connection,
    programId: PublicKey
  ) {
    this.walletAdapter = walletAdapter;
    this.provider = createAnchorProvider(walletAdapter, connection);
    this.program = createSoulboardProgram(this.provider, programId);
  }

  get wallet() {
    return this.walletAdapter;
  }

  get anchorProvider() {
    return this.provider;
  }

  get soulboardProgram() {
    return this.program;
  }

  get publicKey() {
    return new PublicKey(this.walletAdapter.address);
  }

  /**
   * Send a transaction through the wallet
   */
  async sendTransaction(transaction: VersionedTransaction | Transaction): Promise<string> {
    return this.walletAdapter.sendTransaction({ transaction });
  }

  /**
   * Sign a transaction (if supported)
   */
  async signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
    if (!this.walletAdapter.signTransaction) {
      throw new Error("Wallet does not support transaction signing");
    }
    return this.walletAdapter.signTransaction(transaction) as Promise<T>;
  }
}

/**
 * Creates a provider service instance
 */
export function createProviderService(
  walletAdapter: WalletAdapter,
  connection: Connection,
  programId: PublicKey
): ProviderService {
  return new ProviderService(walletAdapter, connection, programId);
}