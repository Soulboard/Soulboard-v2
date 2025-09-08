import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { PublicKey, VersionedTransaction, SystemProgram } from "@solana/web3.js";
import { 
  createProviderService, 
  type WalletAdapter 
} from "@/lib/services/provider.service";
import { 
  createSolTransferTransaction, 
  createTokenTransferTransaction 
} from "@/lib/createTransaction";
import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { SoulboardCore } from "@/types/soulboard_core";
import soulboardIdl from "@/idl/soulboard_core.json";

// Input validation schemas
const walletSchema = z.object({
  address: z.string(),
  type: z.literal("solana-smart-wallet"),
});

const transferSchema = z.object({
  wallet: walletSchema,
  token: z.enum(["sol", "usdc"]),
  recipient: z.string(),
  amount: z.number().positive(),
});

const contractCallSchema = z.object({
  wallet: walletSchema,
  method: z.string(),
  args: z.array(z.any()).optional(),
});

const createCampaignSchema = z.object({
  wallet: walletSchema,
  campaignId: z.number().int().positive(),
  campaignName: z.string().min(1).max(100),
  campaignDescription: z.string().min(1).max(500),
  runningDays: z.number().int().positive().max(365),
  hoursPerDay: z.number().int().positive().max(24),
  baseFeePerHour: z.number().positive(), // In SOL, will be converted to lamports
  initialBudget: z.number().positive().optional(), // In SOL, will be converted to lamports
});

const addBudgetSchema = z.object({
  wallet: walletSchema,
  campaignId: z.number().int().positive(),
  amount: z.number().positive(), // In SOL, will be converted to lamports
});

export const contractsRouter = createTRPCRouter({
  /**
   * Create a new Soulboard campaign
   */
  createCampaign: publicProcedure
    .input(createCampaignSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Validate wallet address
        let authorityPubkey: PublicKey;
        try {
          authorityPubkey = new PublicKey(input.wallet.address);
        } catch {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid wallet address",
          });
        }

        // Convert base fee from SOL to lamports
        const baseFeePerHourLamports = new anchor.BN(
          input.baseFeePerHour * anchor.web3.LAMPORTS_PER_SOL
        );

        // Convert initial budget from SOL to lamports if provided
        const initialBudgetLamports = input.initialBudget 
          ? new anchor.BN(input.initialBudget * anchor.web3.LAMPORTS_PER_SOL)
          : new anchor.BN(0);

        // Derive campaign PDA
        const [campaignPDA] = anchor.web3.PublicKey.findProgramAddressSync(
          [
            Buffer.from("campaign"),
            authorityPubkey.toBuffer(),
            new anchor.BN(input.campaignId).toBuffer("le", 4),
          ],
          ctx.soulboardProgramId
        );

        // Create a mock wallet for transaction building
        const mockWallet = {
          publicKey: authorityPubkey,
          signTransaction: async () => { throw new Error("Mock wallet"); },
          signAllTransactions: async () => { throw new Error("Mock wallet"); },
        };

        // Create provider and program instance
        const provider = new AnchorProvider(
          ctx.connection,
          mockWallet as any,
          { commitment: "confirmed" }
        );

        const program = new Program(
          soulboardIdl as anchor.Idl,
          provider
        ) as Program<SoulboardCore>;

        // Build the transaction instruction
        const instruction = await program.methods
          .createCampaign(
            input.campaignId,
            input.campaignName,
            input.campaignDescription,
            input.runningDays,
            input.hoursPerDay,
            baseFeePerHourLamports
          )
          .accountsPartial({
            authority: authorityPubkey,
            campaign: campaignPDA,
            systemProgram: SystemProgram.programId,
          })
          .instruction();

        const instructions = [instruction];

        // Add budget if initial budget is provided
        if (input.initialBudget && input.initialBudget > 0) {
          const addBudgetInstruction = await program.methods
            .addBudget(input.campaignId, initialBudgetLamports)
            .accountsPartial({
              authority: authorityPubkey,
              campaign: campaignPDA,
              systemProgram: SystemProgram.programId,
            })
            .instruction();
          
          instructions.push(addBudgetInstruction);
        }

        // Create transaction
        const { blockhash } = await ctx.connection.getLatestBlockhash();
        const transaction = new VersionedTransaction(
          new anchor.web3.TransactionMessage({
            payerKey: authorityPubkey,
            recentBlockhash: blockhash,
            instructions: instructions,
          }).compileToV0Message()
        );

        return {
          transaction: Buffer.from(transaction.serialize()).toString('base64'),
          campaignPDA: campaignPDA.toString(),
          campaignId: input.campaignId,
          message: `Campaign "${input.campaignName}" creation transaction prepared${input.initialBudget ? ` with initial budget of ${input.initialBudget} SOL` : ''}`,
          details: {
            runningDays: input.runningDays,
            hoursPerDay: input.hoursPerDay,
            baseFeePerHour: input.baseFeePerHour,
            baseFeePerHourLamports: baseFeePerHourLamports.toString(),
            initialBudget: input.initialBudget || 0,
            initialBudgetLamports: initialBudgetLamports.toString(),
          },
        };
      } catch (error) {
        console.error("Create campaign error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Campaign creation failed",
        });
      }
    }),

  /**
   * Add budget to an existing campaign
   */
  addBudget: publicProcedure
    .input(addBudgetSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Validate wallet address
        let authorityPubkey: PublicKey;
        try {
          authorityPubkey = new PublicKey(input.wallet.address);
        } catch {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid wallet address",
          });
        }

        // Convert amount from SOL to lamports
        const amountLamports = new anchor.BN(
          input.amount * anchor.web3.LAMPORTS_PER_SOL
        );

        // Derive campaign PDA
        const [campaignPDA] = anchor.web3.PublicKey.findProgramAddressSync(
          [
            Buffer.from("campaign"),
            authorityPubkey.toBuffer(),
            new anchor.BN(input.campaignId).toBuffer("le", 4),
          ],
          ctx.soulboardProgramId
        );

        // Create a mock wallet for transaction building
        const mockWallet = {
          publicKey: authorityPubkey,
          signTransaction: async () => { throw new Error("Mock wallet"); },
          signAllTransactions: async () => { throw new Error("Mock wallet"); },
        };

        // Create provider and program instance
        const provider = new AnchorProvider(
          ctx.connection,
          mockWallet as any,
          { commitment: "confirmed" }
        );

        const program = new Program(
          soulboardIdl as anchor.Idl,
          provider
        ) as Program<SoulboardCore>;

        // Check if campaign exists
        try {
          await program.account.campaign.fetch(campaignPDA);
        } catch {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Campaign with ID ${input.campaignId} not found`,
          });
        }

        // Build the add budget instruction
        const instruction = await program.methods
          .addBudget(input.campaignId, amountLamports)
          .accountsPartial({
            authority: authorityPubkey,
            campaign: campaignPDA,
            systemProgram: SystemProgram.programId,
          })
          .instruction();

        // Create transaction
        const { blockhash } = await ctx.connection.getLatestBlockhash();
        const transaction = new VersionedTransaction(
          new anchor.web3.TransactionMessage({
            payerKey: authorityPubkey,
            recentBlockhash: blockhash,
            instructions: [instruction],
          }).compileToV0Message()
        );

        return {
          transaction: Buffer.from(transaction.serialize()).toString('base64'),
          campaignPDA: campaignPDA.toString(),
          campaignId: input.campaignId,
          message: `Added ${input.amount} SOL budget to campaign ${input.campaignId}`,
          details: {
            amount: input.amount,
            amountLamports: amountLamports.toString(),
          },
        };
      } catch (error) {
        console.error("Add budget error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Add budget failed",
        });
      }
    }),

  /**
   * Transfer SOL or USDC tokens
   */
  transfer: publicProcedure
    .input(transferSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Validate recipient address
        try {
          new PublicKey(input.recipient);
        } catch {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid recipient address",
          });
        }

        // Create the appropriate transaction
        let transaction: VersionedTransaction;
        
        if (input.token === "sol") {
          transaction = await createSolTransferTransaction(
            input.wallet.address,
            input.recipient,
            input.amount
          );
        } else {
          const usdcMint = process.env.NEXT_PUBLIC_USDC_TOKEN_MINT || 
            "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
          
          transaction = await createTokenTransferTransaction(
            input.wallet.address,
            input.recipient,
            usdcMint,
            input.amount
          );
        }

        // Return the serialized transaction for client-side signing
        return {
          transaction: Buffer.from(transaction.serialize()).toString('base64'),
          message: `${input.token.toUpperCase()} transfer transaction created`,
        };
      } catch (error) {
        console.error("Transfer error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Transfer failed",
        });
      }
    }),

  /**
   * Execute a Soulboard contract method
   */
  executeSoulboardMethod: publicProcedure
    .input(contractCallSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Create wallet adapter from input
        const walletAdapter: WalletAdapter = {
          address: input.wallet.address,
          sendTransaction: async () => {
            throw new Error("sendTransaction should be handled on client side");
          },
        };

        // Create provider service
        const providerService = createProviderService(
          walletAdapter,
          ctx.connection,
          ctx.soulboardProgramId
        );

        // Get the program instance for contract interactions
        const program = providerService.soulboardProgram;
        
        // Example implementation - you would implement specific methods here
        // This is a generic placeholder that returns transaction data
        switch (input.method) {
          case "addBudget":
            // Example for add_budget method
            if (!input.args || input.args.length < 2) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "addBudget requires campaignId and amount arguments",
              });
            }
            
            // Return serialized transaction instruction data
            return {
              method: input.method,
              args: input.args,
              programId: ctx.soulboardProgramId.toString(),
              message: "Contract method call prepared - implement actual transaction building",
            };
            
          default:
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Method '${input.method}' not implemented. Available methods: addBudget`,
            });
        }
      } catch (error) {
        console.error("Contract execution error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Contract execution failed",
        });
      }
    }),

  /**
   * Get account data from a Soulboard contract
   */
  getSoulboardAccount: publicProcedure
    .input(z.object({
      accountAddress: z.string(),
      accountType: z.enum(["campaign", "providerRegistry", "providerMetadata", "soulboard"]).optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        // Validate account address
        const accountPubkey = new PublicKey(input.accountAddress);
        
        // Get raw account data
        const accountInfo = await ctx.connection.getAccountInfo(accountPubkey);
        
        if (!accountInfo) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Account not found",
          });
        }

        return {
          address: input.accountAddress,
          owner: accountInfo.owner.toString(),
          lamports: accountInfo.lamports,
          dataLength: accountInfo.data.length,
          executable: accountInfo.executable,
          // You can add specific account type parsing here based on input.accountType
        };
      } catch (error) {
        console.error("Get account error:", error);
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Account not found or failed to fetch",
        });
      }
    }),

  /**
   * Get the balance for an address
   */
  getBalance: publicProcedure
    .input(z.object({
      address: z.string(),
      tokenMint: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const publicKey = new PublicKey(input.address);
        
        if (input.tokenMint) {
          // Get token balance
          const { getAccount, getAssociatedTokenAddress } = await import("@solana/spl-token");
          const tokenMintPubkey = new PublicKey(input.tokenMint);
          
          try {
            const tokenAccount = await getAssociatedTokenAddress(
              tokenMintPubkey,
              publicKey,
              true
            );
            
            const account = await getAccount(ctx.connection, tokenAccount);
            return {
              balance: account.amount.toString(),
              decimals: 6, // USDC has 6 decimals
              type: "token",
            };
          } catch {
            return {
              balance: "0",
              decimals: 6,
              type: "token",
            };
          }
        } else {
          // Get SOL balance
          const balance = await ctx.connection.getBalance(publicKey);
          return {
            balance: balance.toString(),
            decimals: 9, // SOL has 9 decimals
            type: "sol",
          };
        }
      } catch (error) {
        console.error("Get balance error:", error);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid address or failed to fetch balance",
        });
      }
    }),

  /**
   * Get campaigns created by a user
   */
  getUserCampaigns: publicProcedure
    .input(z.object({
      userAddress: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const userPubkey = new PublicKey(input.userAddress);
        
        // Create a mock wallet for the program instance
        const mockWallet = {
          publicKey: userPubkey,
          signTransaction: async () => { throw new Error("Mock wallet"); },
          signAllTransactions: async () => { throw new Error("Mock wallet"); },
        };

        // Create provider and program instance
        const provider = new AnchorProvider(
          ctx.connection,
          mockWallet as any,
          { commitment: "confirmed" }
        );

        const program = new Program(
          soulboardIdl as anchor.Idl,
          provider
        ) as Program<SoulboardCore>;

        // Get all program accounts that are campaigns for this user
        const campaignAccounts = await program.account.campaign.all([
          {
            memcmp: {
              offset: 8, // Skip discriminator
              bytes: userPubkey.toBase58(),
            },
          },
        ]);

        // Transform the campaign data for frontend consumption
        const campaigns = campaignAccounts.map((campaign) => {
          const data = campaign.account as any;
          return {
            publicKey: campaign.publicKey.toString(),
            authority: data.authority.toString(),
            campaignId: data.campaignId,
            campaignName: data.campaignName,
            campaignDescription: data.campaignDescription,
            campaignBudget: data.campaignBudget.toString(),
            campaignStatus: data.campaignStatus,
            campaignProviders: data.campaignProviders.map((p: any) => p.toString()),
            campaignLocations: data.campaignLocations.map((l: any) => l.toString()),
            runningDays: data.runningDays,
            hoursPerDay: data.hoursPerDay,
            baseFeePerHour: data.baseFeePerHour.toString(),
            platformFee: data.platformFee.toString(),
            totalDistributed: data.totalDistributed.toString(),
            campaignPerformance: data.campaignPerformance,
          };
        });

        return {
          campaigns,
          total: campaigns.length,
        };
      } catch (error) {
        console.error("Get user campaigns error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to fetch campaigns",
        });
      }
    }),
});