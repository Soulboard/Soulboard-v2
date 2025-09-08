import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { PublicKey, SystemProgram, VersionedTransaction, Keypair, Transaction } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { SoulboardCore } from "@/types/soulboard_core";
import soulboardIdl from "@/idl/soulboard_core.json";
import fs from "fs";

// Input validation schemas
const walletSchema = z.object({
  address: z.string(),
  type: z.literal("solana-smart-wallet"),
});

// Server wallet utilities
const WALLET_PATH = process.env.WALLET_PATH ?? `${process.env.HOME}/.config/solana/id.json`;

function loadServerWallet(): Keypair {
  try {
    const walletData = fs.readFileSync(WALLET_PATH, "utf8");
    const secretKey = JSON.parse(walletData);
    return Keypair.fromSecretKey(new Uint8Array(secretKey));
  } catch (error) {
    console.error("Failed to load server wallet:", error);
    throw new Error(`Failed to load server wallet from ${WALLET_PATH}`);
  }
}

async function ensureRegistryInitialized(connection: anchor.web3.Connection, programId: PublicKey): Promise<void> {
  const [registryPDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("provider_registry")],
    programId
  );

  // Check if registry already exists
  const existingAccount = await connection.getAccountInfo(registryPDA);
  if (existingAccount) {
    console.log("Registry already initialized:", registryPDA.toString());
    return; // Already initialized
  }

  try {
    console.log("Registry not found, initializing with server wallet...");
    console.log("Using wallet path:", WALLET_PATH);
    
    // Load server wallet
    const serverWallet = loadServerWallet();
    console.log("Server wallet loaded:", serverWallet.publicKey.toString());
    
    // Create provider and program instance
    const provider = new AnchorProvider(
      connection,
      {
        publicKey: serverWallet.publicKey,
        signTransaction: async (tx: Transaction) => {
          tx.sign(serverWallet);
          return tx;
        },
        signAllTransactions: async (txs: Transaction[]) => {
          txs.forEach((tx: Transaction) => tx.sign(serverWallet));
          return txs;
        },
      } as any,
      { commitment: "confirmed" }
    );

    const program = new Program(
      soulboardIdl as anchor.Idl,
      provider
    ) as Program<SoulboardCore>;

    // Build and send the initialize registry transaction
    console.log("Sending initialize registry transaction...");
    const initTx = await program.methods
      .initializeRegistry()
      .accountsPartial({
        authority: serverWallet.publicKey,
        providerRegistry: registryPDA,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Registry initialized successfully!");
    console.log("Transaction hash:", initTx);
    console.log("Registry PDA:", registryPDA.toString());
  } catch (error) {
    console.error("Failed to initialize registry:", error);
    throw new Error(`Failed to initialize provider registry: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

const registerProviderSchema = z.object({
  wallet: walletSchema,
  name: z.string().min(1).max(100),
  location: z.string().min(1).max(200),
  contactEmail: z.string().email().max(150),
});

const updateProviderSchema = z.object({
  wallet: walletSchema,
  name: z.string().min(1).max(100).optional(),
  location: z.string().min(1).max(200).optional(),
  contactEmail: z.string().email().max(150).optional(),
  isActive: z.boolean().optional(),
});

const addDeviceSchema = z.object({
  wallet: walletSchema,
  deviceId: z.number().int().positive(),
});

const providerDetailsSchema = z.object({
  providerAddress: z.string(),
});

const providerLocationsSchema = z.object({
  providerAddress: z.string(),
});

const providerDevicesSchema = z.object({
  providerAddress: z.string(),
  includeMetadata: z.boolean().default(true),
});

export const providerRouter = createTRPCRouter({
  /**
   * Initialize the provider registry (server-side operation)
   */
  initializeRegistry: publicProcedure
    .mutation(async ({ ctx }) => {
      try {
        await ensureRegistryInitialized(ctx.connection, ctx.soulboardProgramId);
        
        return {
          message: "Registry initialization completed successfully",
          success: true,
        };

      } catch (error) {
        console.error("Registry initialization error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to initialize registry: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  /**
   * Register a new advertising service provider (ASP)
   */
  registerProvider: publicProcedure
    .input(registerProviderSchema)
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

        // Derive provider PDAs
        const [adProviderPDA] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("ad_provider"), authorityPubkey.toBuffer()],
          ctx.soulboardProgramId
        );

        const [providerMetadataPDA] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("provider_metadata"), authorityPubkey.toBuffer()],
          ctx.soulboardProgramId
        );

        const [registryPDA] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("provider_registry")],
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

        // Build the register provider instruction
        const registerInstruction = await program.methods
          .registerProvider(input.name, input.location, input.contactEmail)
          .accountsPartial({
            authority: authorityPubkey,
            adProvider: adProviderPDA,
            providerRegistry: registryPDA,
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
            instructions: [registerInstruction],
          }).compileToV0Message()
        );

        return {
          transaction: Buffer.from(transaction.serialize()).toString('base64'),
          message: "Provider registration transaction created successfully",
          adProviderPDA: adProviderPDA.toString(),
          providerMetadataPDA: providerMetadataPDA.toString(),
        };

      } catch (error) {
        console.error("Provider registration error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to create provider registration transaction: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  /**
   * Update an existing provider's information
   */
  updateProvider: publicProcedure
    .input(updateProviderSchema)
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

        // Derive provider PDAs
        const [adProviderPDA] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("ad_provider"), authorityPubkey.toBuffer()],
          ctx.soulboardProgramId
        );

        const [providerMetadataPDA] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("provider_metadata"), authorityPubkey.toBuffer()],
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

        // Build the update provider instruction
        const updateInstruction = await program.methods
          .updateProvider(
            input.name || null,
            input.location || null,
            input.contactEmail || null,
            input.isActive !== undefined ? input.isActive : null
          )
          .accountsPartial({
            authority: authorityPubkey,
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
            instructions: [updateInstruction],
          }).compileToV0Message()
        );

        return {
          transaction: Buffer.from(transaction.serialize()).toString('base64'),
          message: "Provider update transaction created successfully",
        };

      } catch (error) {
        console.error("Provider update error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to create provider update transaction: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  /**
   * Add a device to provider's inventory
   */
  addDevice: publicProcedure
    .input(addDeviceSchema)
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

        // Derive provider PDAs
        const [adProviderPDA] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("ad_provider"), authorityPubkey.toBuffer()],
          ctx.soulboardProgramId
        );

        const [providerMetadataPDA] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("provider_metadata"), authorityPubkey.toBuffer()],
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

        // Build the add device instruction
        const addDeviceInstruction = await program.methods
          .getDevice(input.deviceId)
          .accountsPartial({
            authority: authorityPubkey,
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
            instructions: [addDeviceInstruction],
          }).compileToV0Message()
        );

        return {
          transaction: Buffer.from(transaction.serialize()).toString('base64'),
          message: "Add device transaction created successfully",
          deviceId: input.deviceId,
        };

      } catch (error) {
        console.error("Add device error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to create add device transaction: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  /**
   * Get all registered providers
   */
  getAllProviders: publicProcedure
    .query(async ({ ctx }) => {
      try {
        // Ensure registry is initialized (auto-initialize if needed)
        await ensureRegistryInitialized(ctx.connection, ctx.soulboardProgramId);

        // Derive registry PDA
        const [registryPDA] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("provider_registry")],
          ctx.soulboardProgramId
        );

        // Create a mock wallet for the provider
        const mockWallet = {
          publicKey: new PublicKey("11111111111111111111111111111111"),
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

        // Try to fetch the registry data directly instead of using view
        try {
          const registry = await program.account.providerRegistry.fetch(registryPDA);
          return {
            providers: registry.providers.map((p: PublicKey) => p.toString()),
            totalProviders: registry.totalProviders,
          };
        } catch (fetchError) {
          // If direct fetch fails, try the view method as fallback
          console.warn("Direct fetch failed, trying view method:", fetchError);
          
          const providers = await program.methods
            .getAllProviders()
            .accountsPartial({
              providerRegistry: registryPDA,
            })
            .view();

          return {
            providers: providers.map((p: PublicKey) => p.toString()),
            totalProviders: providers.length,
          };
        }

      } catch (error) {
        console.error("Get all providers error:", error);
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch providers: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  /**
   * Get provider details by address
   */
  getProviderDetails: publicProcedure
    .input(providerDetailsSchema)
    .query(async ({ input, ctx }) => {
      try {
        // Validate provider address
        let providerPubkey: PublicKey;
        try {
          providerPubkey = new PublicKey(input.providerAddress);
        } catch {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid provider address",
          });
        }

        // Derive provider PDAs
        const [adProviderPDA] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("ad_provider"), providerPubkey.toBuffer()],
          ctx.soulboardProgramId
        );

        const [providerMetadataPDA] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("provider_metadata"), providerPubkey.toBuffer()],
          ctx.soulboardProgramId
        );

        // Create a mock wallet for the provider
        const mockWallet = {
          publicKey: new PublicKey("11111111111111111111111111111111"),
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

        // Fetch provider account data
        const [adProvider, providerMetadata] = await Promise.all([
          program.account.adProvider.fetch(adProviderPDA),
          program.account.providerMetadata.fetch(providerMetadataPDA)
        ]);

        return {
          adProvider: {
            authority: adProvider.authority.toString(),
            name: adProvider.name,
            location: adProvider.location,
            contactEmail: adProvider.contactEmail,
            rating: adProvider.rating,
            totalCampaigns: adProvider.totalCampaigns,
            isActive: adProvider.isActive,
            totalEarnings: adProvider.totalEarnings.toString(),
            pendingPayments: adProvider.pendingPayments.toString(),
            devices: adProvider.devices.map((device: any) => ({
              deviceId: device.deviceId,
              deviceState: Object.keys(device.deviceState)[0],
            })),
          },
          metadata: {
            authority: providerMetadata.authority.toString(),
            providerPda: providerMetadata.providerPda.toString(),
            name: providerMetadata.name,
            location: providerMetadata.location,
            deviceCount: providerMetadata.deviceCount,
            availableDevices: providerMetadata.availableDevices,
            rating: providerMetadata.rating,
            isActive: providerMetadata.isActive,
          },
        };

      } catch (error) {
        console.error("Get provider details error:", error);
        
        // Handle case where provider doesn't exist
        if (error instanceof Error && error.message?.includes("Account does not exist")) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Provider not found",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch provider details: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  /**
   * Get provider registry information
   */
  getRegistryInfo: publicProcedure
    .query(async ({ ctx }) => {
      try {
        // Ensure registry is initialized (auto-initialize if needed)
        await ensureRegistryInitialized(ctx.connection, ctx.soulboardProgramId);

        // Derive registry PDA
        const [registryPDA] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("provider_registry")],
          ctx.soulboardProgramId
        );

        // Create a mock wallet for the provider
        const mockWallet = {
          publicKey: new PublicKey("11111111111111111111111111111111"),
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

        // Fetch registry data
        const registry = await program.account.providerRegistry.fetch(registryPDA);

        return {
          deployer: registry.deployer.toString(),
          totalProviders: registry.totalProviders,
          providers: registry.providers.map((p: PublicKey) => p.toString()),
          keepers: registry.keepers.map((k: PublicKey) => k.toString()),
          registryPDA: registryPDA.toString(),
        };

      } catch (error) {
        console.error("Get registry info error:", error);
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch registry info: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  /**
   * Check if a provider is registered
   */
  isProviderRegistered: publicProcedure
    .input(providerDetailsSchema)
    .query(async ({ input, ctx }) => {
      try {
        // Validate provider address
        let providerPubkey: PublicKey;
        try {
          providerPubkey = new PublicKey(input.providerAddress);
        } catch {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid provider address",
          });
        }

        // Derive provider PDA
        const [adProviderPDA] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("ad_provider"), providerPubkey.toBuffer()],
          ctx.soulboardProgramId
        );

        // Check if account exists
        const accountInfo = await ctx.connection.getAccountInfo(adProviderPDA);
        
        return {
          isRegistered: accountInfo !== null,
          providerPDA: adProviderPDA.toString(),
        };

      } catch (error) {
        console.error("Check provider registration error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to check provider registration: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  /**
   * Get provider locations and their details
   */
  getProviderLocations: publicProcedure
    .input(providerLocationsSchema)
    .query(async ({ input, ctx }) => {
      try {
        // Validate provider address
        let providerPubkey: PublicKey;
        try {
          providerPubkey = new PublicKey(input.providerAddress);
        } catch {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid provider address",
          });
        }

        // Derive provider PDAs
        const [adProviderPDA] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("ad_provider"), providerPubkey.toBuffer()],
          ctx.soulboardProgramId
        );

        const [providerMetadataPDA] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("provider_metadata"), providerPubkey.toBuffer()],
          ctx.soulboardProgramId
        );

        // Create a mock wallet for the provider
        const mockWallet = {
          publicKey: new PublicKey("11111111111111111111111111111111"),
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

        // Fetch provider account data
        const [adProvider, providerMetadata] = await Promise.all([
          program.account.adProvider.fetch(adProviderPDA),
          program.account.providerMetadata.fetch(providerMetadataPDA)
        ]);

        // Extract location information
        const locations = {
          primaryLocation: {
            address: adProvider.location,
            name: adProvider.name,
            contactEmail: adProvider.contactEmail,
          },
          deviceLocations: adProvider.devices.map((device: any) => ({
            deviceId: device.deviceId,
            deviceState: Object.keys(device.deviceState)[0],
            location: adProvider.location, // Devices inherit provider location
          })),
        };

        return {
          providerAddress: input.providerAddress,
          totalDevices: adProvider.devices.length,
          availableDevices: providerMetadata.availableDevices,
          locations,
          metadata: {
            isActive: adProvider.isActive,
            rating: adProvider.rating,
            totalCampaigns: adProvider.totalCampaigns,
          },
        };

      } catch (error) {
        console.error("Get provider locations error:", error);
        
        // Handle case where provider doesn't exist
        if (error instanceof Error && error.message?.includes("Account does not exist")) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Provider not found",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch provider locations: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  /**
   * Get provider devices with detailed information
   */
  getProviderDevices: publicProcedure
    .input(providerDevicesSchema)
    .query(async ({ input, ctx }) => {
      try {
        // Validate provider address
        let providerPubkey: PublicKey;
        try {
          providerPubkey = new PublicKey(input.providerAddress);
        } catch {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid provider address",
          });
        }

        // Derive provider PDAs
        const [adProviderPDA] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("ad_provider"), providerPubkey.toBuffer()],
          ctx.soulboardProgramId
        );

        const [providerMetadataPDA] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("provider_metadata"), providerPubkey.toBuffer()],
          ctx.soulboardProgramId
        );

        // Create a mock wallet for the provider
        const mockWallet = {
          publicKey: new PublicKey("11111111111111111111111111111111"),
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

        // Fetch provider account data
        const [adProvider, providerMetadata] = await Promise.all([
          program.account.adProvider.fetch(adProviderPDA),
          program.account.providerMetadata.fetch(providerMetadataPDA)
        ]);

        // Process device information
        const devices = adProvider.devices.map((device: any) => {
          const deviceState = Object.keys(device.deviceState)[0];
          return {
            deviceId: device.deviceId,
            deviceState,
            isAvailable: deviceState === 'available',
            isBooked: deviceState === 'booked',
            isOrdered: deviceState === 'ordered',
            isPaused: deviceState === 'paused',
            location: adProvider.location,
            ...(input.includeMetadata && {
              metadata: {
                providerName: adProvider.name,
                providerRating: adProvider.rating,
                contactEmail: adProvider.contactEmail,
                addedTimestamp: Date.now(), // Would be actual timestamp in real implementation
              }
            }),
          };
        });

        // Group devices by state
        const devicesByState = {
          available: devices.filter(d => d.deviceState === 'available'),
          booked: devices.filter(d => d.deviceState === 'booked'),
          ordered: devices.filter(d => d.deviceState === 'ordered'),
          paused: devices.filter(d => d.deviceState === 'paused'),
        };

        return {
          providerAddress: input.providerAddress,
          summary: {
            totalDevices: devices.length,
            availableDevices: devicesByState.available.length,
            bookedDevices: devicesByState.booked.length,
            orderedDevices: devicesByState.ordered.length,
            pausedDevices: devicesByState.paused.length,
          },
          devices,
          devicesByState,
          providerInfo: {
            name: adProvider.name,
            location: adProvider.location,
            isActive: adProvider.isActive,
            rating: adProvider.rating,
            totalEarnings: adProvider.totalEarnings.toString(),
            totalCampaigns: adProvider.totalCampaigns,
          },
        };

      } catch (error) {
        console.error("Get provider devices error:", error);
        
        // Handle case where provider doesn't exist
        if (error instanceof Error && error.message?.includes("Account does not exist")) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Provider not found",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch provider devices: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  /**
   * Get available devices across all providers (for campaign booking)
   */
  getAvailableDevices: publicProcedure
    .query(async ({ ctx }) => {
      try {
        // First get all providers
        const [registryPDA] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("provider_registry")],
          ctx.soulboardProgramId
        );

        // Check if the registry account exists
        const registryAccountInfo = await ctx.connection.getAccountInfo(registryPDA);
        if (!registryAccountInfo) {
          return {
            totalAvailableDevices: 0,
            availableDevices: [],
            summary: {
              totalProviders: 0,
              providersWithAvailableDevices: 0,
            },
            message: "Provider registry not initialized yet",
          };
        }

        // Create a mock wallet for the provider
        const mockWallet = {
          publicKey: new PublicKey("11111111111111111111111111111111"),
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

        // Get all providers - try direct fetch first
        let providers: PublicKey[] = [];
        try {
          const registry = await program.account.providerRegistry.fetch(registryPDA);
          providers = registry.providers;
        } catch (fetchError) {
          console.warn("Direct registry fetch failed, trying view method:", fetchError);
          try {
            providers = await program.methods
              .getAllProviders()
              .accountsPartial({
                providerRegistry: registryPDA,
              })
              .view();
          } catch (viewError) {
            console.warn("View method also failed:", viewError);
            return {
              totalAvailableDevices: 0,
              availableDevices: [],
              summary: {
                totalProviders: 0,
                providersWithAvailableDevices: 0,
              },
              message: "Unable to fetch providers from registry",
            };
          }
        }

        // Fetch all provider data and their devices
        const availableDevices = [];
        
        for (const providerPubkey of providers) {
          try {
            const [adProviderPDA] = anchor.web3.PublicKey.findProgramAddressSync(
              [Buffer.from("ad_provider"), providerPubkey.toBuffer()],
              ctx.soulboardProgramId
            );

            const adProvider = await program.account.adProvider.fetch(adProviderPDA);
            
            // Filter available devices
            const devicesList = adProvider.devices
              .filter((device: any) => Object.keys(device.deviceState)[0] === 'available')
              .map((device: any) => ({
                deviceId: device.deviceId,
                providerAddress: providerPubkey.toString(),
                providerName: adProvider.name,
                location: adProvider.location,
                providerRating: adProvider.rating,
                contactEmail: adProvider.contactEmail,
                isActive: adProvider.isActive,
              }));

            availableDevices.push(...devicesList);
          } catch (error) {
            // Skip providers that can't be fetched
            console.warn(`Skipped provider ${providerPubkey.toString()}:`, error);
          }
        }

        return {
          totalAvailableDevices: availableDevices.length,
          availableDevices,
          summary: {
            totalProviders: providers.length,
            providersWithAvailableDevices: [...new Set(availableDevices.map(d => d.providerAddress))].length,
          },
        };

      } catch (error) {
        console.error("Get available devices error:", error);
        
        // Check if it's a registry not found error
        if (error instanceof Error && (
          error.message?.includes("Account does not exist") ||
          error.message?.includes("Invalid account discriminator")
        )) {
          return {
            totalAvailableDevices: 0,
            availableDevices: [],
            summary: {
              totalProviders: 0,
              providersWithAvailableDevices: 0,
            },
            message: "Provider registry not initialized yet",
          };
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch available devices: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),
});