import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { PublicKey, SystemProgram, VersionedTransaction } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { SoulboardCore } from "@/types/soulboard_core";
import soulboardIdl from "@/idl/soulboard_core.json";

// Input validation schemas
const walletSchema = z.object({
  address: z.string(),
  type: z.literal("solana-smart-wallet"),
});

const addLocationSchema = z.object({
  wallet: walletSchema,
  campaignId: z.number().int().positive(),
  location: z.string(), // Provider address as string
  deviceId: z.number().int().positive(),
});

const removeLocationSchema = z.object({
  wallet: walletSchema,
  campaignId: z.number().int().positive(),
  location: z.string(), // Provider address as string
  deviceId: z.number().int().positive(),
});

const campaignQuerySchema = z.object({
  campaignId: z.number().int().positive(),
  userAddress: z.string(),
});

const campaignDetailsSchema = z.object({
  campaignId: z.number().int().positive(),
});

const deleteCampaignSchema = z.object({
  wallet: walletSchema,
  campaignId: z.number().int().positive(),
});

export const campaignsRouter = createTRPCRouter({
  /**
   * Add a location (device) to a campaign
   */
  addLocation: publicProcedure
    .input(addLocationSchema)
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

        // Validate location address
        let locationPubkey: PublicKey;
        try {
          locationPubkey = new PublicKey(input.location);
        } catch {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid location address",
          });
        }

        // Derive campaign PDA
        const [campaignPDA] = anchor.web3.PublicKey.findProgramAddressSync(
          [
            Buffer.from("campaign"),
            authorityPubkey.toBuffer(),
            new anchor.BN(input.campaignId).toBuffer("le", 4),
          ],
          ctx.soulboardProgramId
        );

        // Derive adProvider PDA for the location
        const [adProviderPDA] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("ad_provider"), locationPubkey.toBuffer()],
          ctx.soulboardProgramId
        );

        // Derive providerMetadata PDA for the location
        const [providerMetadataPDA] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("provider_metadata"), locationPubkey.toBuffer()],
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

        // Build the add location instruction
        const addLocationInstruction = await program.methods
          .addLocation(input.campaignId, locationPubkey, input.deviceId)
          .accountsPartial({
            authority: authorityPubkey,
            campaign: campaignPDA,
            adProvider: adProviderPDA,
            providerMetadata: providerMetadataPDA,
            systemProgram: SystemProgram.programId,
          })
          .instruction();

        // Create transaction
        const { blockhash } = await ctx.connection.getLatestBlockhash();
        const transaction = new VersionedTransaction(
          new anchor.web3.TransactionMessage({
            payerKey: authorityPubkey,
            recentBlockhash: blockhash,
            instructions: [addLocationInstruction],
          }).compileToV0Message()
        );

        return {
          transaction: Buffer.from(transaction.serialize()).toString('base64'),
          message: "Add location transaction created successfully",
          campaignId: input.campaignId,
          deviceId: input.deviceId,
          campaignPDA: campaignPDA.toString(),
        };

      } catch (error) {
        console.error("Add location error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to create add location transaction: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  /**
   * Remove a location (device) from a campaign
   */
  removeLocation: publicProcedure
    .input(removeLocationSchema)
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

        // Validate location address
        let locationPubkey: PublicKey;
        try {
          locationPubkey = new PublicKey(input.location);
        } catch {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid location address",
          });
        }

        // Derive campaign PDA
        const [campaignPDA] = anchor.web3.PublicKey.findProgramAddressSync(
          [
            Buffer.from("campaign"),
            authorityPubkey.toBuffer(),
            new anchor.BN(input.campaignId).toBuffer("le", 4),
          ],
          ctx.soulboardProgramId
        );

        // Derive adProvider PDA for the location
        const [adProviderPDA] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("ad_provider"), locationPubkey.toBuffer()],
          ctx.soulboardProgramId
        );

        // Derive providerMetadata PDA for the location
        const [providerMetadataPDA] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("provider_metadata"), locationPubkey.toBuffer()],
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

        // Build the remove location instruction
        const removeLocationInstruction = await program.methods
          .removeLocation(input.campaignId, locationPubkey, input.deviceId)
          .accountsPartial({
            authority: authorityPubkey,
            campaign: campaignPDA,
            adProvider: adProviderPDA,
            providerMetadata: providerMetadataPDA,
            systemProgram: SystemProgram.programId,
          })
          .instruction();

        // Create transaction
        const { blockhash } = await ctx.connection.getLatestBlockhash();
        const transaction = new VersionedTransaction(
          new anchor.web3.TransactionMessage({
            payerKey: authorityPubkey,
            recentBlockhash: blockhash,
            instructions: [removeLocationInstruction],
          }).compileToV0Message()
        );

        return {
          transaction: Buffer.from(transaction.serialize()).toString('base64'),
          message: "Remove location transaction created successfully",
          campaignId: input.campaignId,
          deviceId: input.deviceId,
          campaignPDA: campaignPDA.toString(),
        };

      } catch (error) {
        console.error("Remove location error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to create remove location transaction: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  /**
   * Get campaign details and information
   */
  getCampaignDetails: publicProcedure
    .input(campaignDetailsSchema)
    .query(async ({ input, ctx }) => {
      try {
        // Create a mock wallet for data fetching
        const mockWallet = {
          publicKey: new PublicKey("11111111111111111111111111111111"),
          signTransaction: async () => { throw new Error("Mock wallet"); },
          signAllTransactions: async () => { throw new Error("Mock wallet"); },
        };

        const provider = new AnchorProvider(
          ctx.connection,
          mockWallet as any,
          { commitment: "confirmed" }
        );

        const program = new Program(
          soulboardIdl as anchor.Idl,
          provider
        ) as Program<SoulboardCore>;

        // Get all campaigns and find the one with matching campaignId
        const campaigns = await program.account.campaign.all();
        const campaignAccount = campaigns.find(c => c.account.campaignId === input.campaignId);

        if (!campaignAccount) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Campaign not found",
          });
        }

        const campaign = campaignAccount.account;

        return {
          campaignId: input.campaignId,
          campaignPDA: campaignAccount.publicKey.toString(),
          authority: campaign.authority.toString(),
          name: campaign.campaignName,
          description: campaign.campaignDescription,
          budget: campaign.campaignBudget.toString(),
          remaining: (campaign.campaignBudget.sub(new anchor.BN(campaign.totalDistributed || 0))).toString(),
          spent: campaign.totalDistributed?.toString() || "0",
          runningDays: campaign.runningDays,
          hoursPerDay: campaign.hoursPerDay,
          baseFeePerHour: campaign.baseFeePerHour.toString(),
          isActive: campaign.campaignStatus?.toString() === "active",
          isPaused: campaign.campaignStatus?.toString() === "paused",
          locations: campaign.campaignLocations?.map((location: PublicKey) => location.toString()) || [],
          providers: campaign.campaignProviders?.map((provider: PublicKey) => provider.toString()) || [],
          startDate: null, // Not available in current IDL
          endDate: null, // Not available in current IDL
          devices: [], // Would be derived from campaignLocations
          createdAt: new Date().toISOString(), // Not available in current IDL
          updatedAt: new Date().toISOString(), // Not available in current IDL
        };

      } catch (error) {
        console.error("Get campaign details error:", error);
        
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch campaign details: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  /**
   * Get all campaigns for a user
   */
  getUserCampaigns: publicProcedure
    .input(z.object({
      userAddress: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        // Validate user address
        let userPubkey: PublicKey;
        try {
          userPubkey = new PublicKey(input.userAddress);
        } catch {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid user address",
          });
        }

        // Create a mock wallet for data fetching
        const mockWallet = {
          publicKey: new PublicKey("11111111111111111111111111111111"),
          signTransaction: async () => { throw new Error("Mock wallet"); },
          signAllTransactions: async () => { throw new Error("Mock wallet"); },
        };

        const provider = new AnchorProvider(
          ctx.connection,
          mockWallet as any,
          { commitment: "confirmed" }
        );

        const program = new Program(
          soulboardIdl as anchor.Idl,
          provider
        ) as Program<SoulboardCore>;

        // Get all campaign accounts for this user
        // Note: This is a simplified approach. In production, you might want to 
        // maintain an index or use program-derived addresses more efficiently
        const campaigns = await program.account.campaign.all([
          {
            memcmp: {
              offset: 8, // Skip discriminator
              bytes: userPubkey.toBase58(),
            },
          },
        ]);

        return {
          userAddress: input.userAddress,
          totalCampaigns: campaigns.length,
          campaigns: campaigns.map((campaignAccount) => ({
            publicKey: campaignAccount.publicKey.toString(),
            authority: campaignAccount.account.authority.toString(),
            name: campaignAccount.account.campaignName,
            description: campaignAccount.account.campaignDescription,
            budget: campaignAccount.account.campaignBudget.toString(),
            remaining: (campaignAccount.account.campaignBudget.sub(new anchor.BN(campaignAccount.account.totalDistributed || 0))).toString(),
            spent: campaignAccount.account.totalDistributed?.toString() || "0",
            isActive: campaignAccount.account.campaignStatus?.toString() === "active",
            isPaused: campaignAccount.account.campaignStatus?.toString() === "paused",
            devicesCount: campaignAccount.account.campaignLocations?.length || 0,
            createdAt: new Date().toISOString(), // Not available in current IDL
            updatedAt: new Date().toISOString(), // Not available in current IDL
          })),
        };

      } catch (error) {
        console.error("Get user campaigns error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch user campaigns: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  /**
   * Delete/Complete a campaign
   */
  deleteCampaign: publicProcedure
    .input(deleteCampaignSchema)
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

        // Build the complete campaign instruction (this closes/deletes the campaign)
        const completeCampaignInstruction = await program.methods
          .completeCampaign(input.campaignId)
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
            instructions: [completeCampaignInstruction],
          }).compileToV0Message()
        );

        return {
          transaction: Buffer.from(transaction.serialize()).toString('base64'),
          message: "Delete campaign transaction created successfully",
          campaignId: input.campaignId,
          campaignPDA: campaignPDA.toString(),
        };

      } catch (error) {
        console.error("Delete campaign error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to create delete campaign transaction: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  /**
   * Get campaign performance and statistics
   */
  getCampaignStats: publicProcedure
    .input(campaignQuerySchema)
    .query(async ({ input, ctx }) => {
      try {
        // Validate user address
        let userPubkey: PublicKey;
        try {
          userPubkey = new PublicKey(input.userAddress);
        } catch {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid user address",
          });
        }

        // Derive campaign PDA
        const [campaignPDA] = anchor.web3.PublicKey.findProgramAddressSync(
          [
            Buffer.from("campaign"),
            userPubkey.toBuffer(),
            new anchor.BN(input.campaignId).toBuffer("le", 4),
          ],
          ctx.soulboardProgramId
        );

        // Create a mock wallet for data fetching
        const mockWallet = {
          publicKey: new PublicKey("11111111111111111111111111111111"),
          signTransaction: async () => { throw new Error("Mock wallet"); },
          signAllTransactions: async () => { throw new Error("Mock wallet"); },
        };

        const provider = new AnchorProvider(
          ctx.connection,
          mockWallet as any,
          { commitment: "confirmed" }
        );

        const program = new Program(
          soulboardIdl as anchor.Idl,
          provider
        ) as Program<SoulboardCore>;

        // Fetch campaign data
        const campaign = await program.account.campaign.fetch(campaignPDA);

        // Calculate statistics
        const budgetLamports = campaign.campaignBudget.toNumber();
        const spentLamports = campaign.totalDistributed || 0;
        const remainingLamports = budgetLamports - spentLamports;
        
        const budgetSol = budgetLamports / anchor.web3.LAMPORTS_PER_SOL;
        const spentSol = spentLamports / anchor.web3.LAMPORTS_PER_SOL;
        const remainingSol = remainingLamports / anchor.web3.LAMPORTS_PER_SOL;
        
        const spendPercentage = budgetLamports > 0 ? (spentLamports / budgetLamports) * 100 : 0;
        const remainingPercentage = budgetLamports > 0 ? (remainingLamports / budgetLamports) * 100 : 0;

        return {
          campaignId: input.campaignId,
          campaignPDA: campaignPDA.toString(),
          name: campaign.campaignName,
          budget: {
            lamports: budgetLamports,
            sol: budgetSol,
          },
          spent: {
            lamports: spentLamports,
            sol: spentSol,
            percentage: spendPercentage,
          },
          remaining: {
            lamports: remainingLamports,
            sol: remainingSol,
            percentage: remainingPercentage,
          },
          devices: {
            total: campaign.campaignLocations?.length || 0,
            list: campaign.campaignLocations?.map((location: any) => location.toString()) || [],
          },
          status: {
            isActive: campaign.campaignStatus?.toString() === "active",
            isPaused: campaign.campaignStatus?.toString() === "paused",
            isCompleted: campaign.campaignStatus?.toString() === "completed",
          },
          duration: {
            runningDays: campaign.runningDays,
            hoursPerDay: campaign.hoursPerDay,
            totalHours: campaign.runningDays * campaign.hoursPerDay,
          },
          createdAt: new Date().toISOString(), // Not available in current IDL
          updatedAt: new Date().toISOString(), // Not available in current IDL
        };

      } catch (error) {
        console.error("Get campaign stats error:", error);
        
        if (error instanceof Error && error.message?.includes("Account does not exist")) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Campaign not found",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch campaign statistics: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),
});
