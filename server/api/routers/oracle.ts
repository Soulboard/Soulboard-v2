import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { Oracle } from "@/types/oracle";
import oracleIdl from "@/idl/oracle.json";

// Constants
const DEVICE_SEED = Buffer.from("device_feed");
const DEFAULT_CHANNEL_ID = 2890626; // From the integration script

// Input validation schemas
const deviceFeedSchema = z.object({
  deviceId: z.number().int().positive(),
});

const channelFeedSchema = z.object({
  channelId: z.number().int().positive(),
});

const thingSpeakUrlSchema = z.object({
  channelId: z.number().int().positive().optional().default(DEFAULT_CHANNEL_ID),
  results: z.number().int().positive().max(100).default(10),
});

// ThingSpeak API response types
interface ThingSpeakResponse {
  channel: {
    id: number;
    name: string;
    description: string;
    latitude: string;
    longitude: string;
    field1: string;
    field2: string;
    created_at: string;
    updated_at: string;
    last_entry_id: number;
  };
  feeds: Array<{
    created_at: string;
    entry_id: number;
    field1?: string;
    field2?: string;
  }>;
}

interface DeviceFeedAccount {
  channelId: number;
  totalViews: any;
  totalTaps: any;
  lastEntryId: number;
  authority: anchor.web3.PublicKey;
}

export const oracleRouter = createTRPCRouter({
  /**
   * Get device feed data from oracle program
   */
  getDeviceFeed: publicProcedure
    .input(deviceFeedSchema)
    .query(async ({ input, ctx }) => {
      try {
        // Derive device feed PDA
        const [deviceFeedPDA] = anchor.web3.PublicKey.findProgramAddressSync(
          [DEVICE_SEED, new anchor.BN(input.deviceId).toArrayLike(Buffer, "le", 4)],
          ctx.oracleProgramId
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
          oracleIdl as anchor.Idl,
          provider
        ) as Program<Oracle>;

        // Fetch device feed data
        const deviceFeed = await program.account.deviceFeed.fetch(deviceFeedPDA) as DeviceFeedAccount;

        return {
          deviceId: input.deviceId,
          channelId: deviceFeed.channelId,
          totalViews: deviceFeed.totalViews.toString(),
          totalTaps: deviceFeed.totalTaps.toString(),
          lastEntryId: deviceFeed.lastEntryId,
          authority: deviceFeed.authority.toString(),
          feedPDA: deviceFeedPDA.toString(),
          // Convert BN values to readable numbers
          totalViewsNumber: deviceFeed.totalViews.toNumber(),
          totalTapsNumber: deviceFeed.totalTaps.toNumber(),
        };

      } catch (error) {
        console.error("Get device feed error:", error);
        
        // Handle case where device feed doesn't exist
        if (error instanceof Error && error.message?.includes("Account does not exist")) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Device feed for device ID ${input.deviceId} not found. The device may not be initialized in the oracle system.`,
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch device feed: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  /**
   * Get channel feed data by channel ID (for the default channel 2890626)
   */
  getChannelFeed: publicProcedure
    .input(channelFeedSchema.optional())
    .query(async ({ input, ctx }) => {
      try {
        const channelId = input?.channelId || DEFAULT_CHANNEL_ID;
        
        // Derive device feed PDA using channel ID as device ID
        const [deviceFeedPDA] = anchor.web3.PublicKey.findProgramAddressSync(
          [DEVICE_SEED, new anchor.BN(channelId).toArrayLike(Buffer, "le", 4)],
          ctx.oracleProgramId
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
          oracleIdl as anchor.Idl,
          provider
        ) as Program<Oracle>;

        // Fetch device feed data
        const deviceFeed = await program.account.deviceFeed.fetch(deviceFeedPDA) as DeviceFeedAccount;

        return {
          channelId: deviceFeed.channelId,
          totalViews: deviceFeed.totalViews.toString(),
          totalTaps: deviceFeed.totalTaps.toString(),
          lastEntryId: deviceFeed.lastEntryId,
          authority: deviceFeed.authority.toString(),
          feedPDA: deviceFeedPDA.toString(),
          // Convert BN values to readable numbers
          totalViewsNumber: deviceFeed.totalViews.toNumber(),
          totalTapsNumber: deviceFeed.totalTaps.toNumber(),
          isDefaultChannel: channelId === DEFAULT_CHANNEL_ID,
        };

      } catch (error) {
        console.error("Get channel feed error:", error);
        
        // Handle case where channel feed doesn't exist
        if (error instanceof Error && error.message?.includes("Account does not exist")) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Channel feed for channel ID ${input?.channelId || DEFAULT_CHANNEL_ID} not found. The channel may not be initialized in the oracle system.`,
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch channel feed: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  /**
   * Get ThingSpeak channel data directly from API
   */
  getThingSpeakData: publicProcedure
    .input(thingSpeakUrlSchema.optional())
    .query(async ({ input }) => {
      try {
        const channelId = input?.channelId || DEFAULT_CHANNEL_ID;
        const results = input?.results || 10;
        
        const thingSpeakUrl = `https://api.thingspeak.com/channels/${channelId}/feeds.json?results=${results}`;
        
        console.log(`📡 Fetching ThingSpeak data from: ${thingSpeakUrl}`);
        
        const response = await fetch(thingSpeakUrl);
        
        if (!response.ok) {
          throw new Error(`ThingSpeak API returned ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json() as ThingSpeakResponse;
        
        // Process the feeds to extract views and taps
        const processedFeeds = (data.feeds || []).map(feed => ({
          entryId: feed.entry_id,
          createdAt: feed.created_at,
          views: Number(feed.field1 || 0),
          taps: Number(feed.field2 || 0),
          rawField1: feed.field1,
          rawField2: feed.field2,
        }));

        // Calculate totals
        const totalViews = processedFeeds.reduce((sum, feed) => sum + feed.views, 0);
        const totalTaps = processedFeeds.reduce((sum, feed) => sum + feed.taps, 0);
        
        return {
          channel: {
            id: data.channel.id,
            name: data.channel.name,
            description: data.channel.description,
            latitude: data.channel.latitude,
            longitude: data.channel.longitude,
            field1Label: data.channel.field1,
            field2Label: data.channel.field2,
            createdAt: data.channel.created_at,
            updatedAt: data.channel.updated_at,
            lastEntryId: data.channel.last_entry_id,
          },
          feeds: processedFeeds,
          statistics: {
            totalFeeds: processedFeeds.length,
            totalViews,
            totalTaps,
            latestEntryId: data.channel.last_entry_id,
            oldestEntryId: processedFeeds.length > 0 ? Math.min(...processedFeeds.map(f => f.entryId)) : 0,
          },
          meta: {
            channelId,
            resultsRequested: results,
            apiUrl: thingSpeakUrl,
            fetchedAt: new Date().toISOString(),
          },
        };

      } catch (error) {
        console.error("Get ThingSpeak data error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch ThingSpeak data: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  /**
   * Get all device feeds (scan for initialized feeds)
   */
  getAllDeviceFeeds: publicProcedure
    .query(async ({ ctx }) => {
      try {
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
          oracleIdl as anchor.Idl,
          provider
        ) as Program<Oracle>;

        // Get all device feed accounts
        const deviceFeeds = await program.account.deviceFeed.all();

        const processedFeeds = deviceFeeds.map((feedAccount) => {
          const feed = feedAccount.account as DeviceFeedAccount;
          return {
            publicKey: feedAccount.publicKey.toString(),
            channelId: feed.channelId,
            totalViews: feed.totalViews.toString(),
            totalTaps: feed.totalTaps.toString(),
            lastEntryId: feed.lastEntryId,
            authority: feed.authority.toString(),
            // Convert BN values to readable numbers
            totalViewsNumber: feed.totalViews.toNumber(),
            totalTapsNumber: feed.totalTaps.toNumber(),
            isDefaultChannel: feed.channelId === DEFAULT_CHANNEL_ID,
          };
        });

        // Calculate aggregate statistics
        const totalViews = processedFeeds.reduce((sum, feed) => sum + feed.totalViewsNumber, 0);
        const totalTaps = processedFeeds.reduce((sum, feed) => sum + feed.totalTapsNumber, 0);

        return {
          feeds: processedFeeds,
          statistics: {
            totalFeeds: processedFeeds.length,
            totalViews,
            totalTaps,
            averageViewsPerFeed: processedFeeds.length > 0 ? totalViews / processedFeeds.length : 0,
            averageTapsPerFeed: processedFeeds.length > 0 ? totalTaps / processedFeeds.length : 0,
          },
          meta: {
            defaultChannelId: DEFAULT_CHANNEL_ID,
            fetchedAt: new Date().toISOString(),
          },
        };

      } catch (error) {
        console.error("Get all device feeds error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch device feeds: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  /**
   * Get oracle program info and statistics
   */
  getOracleInfo: publicProcedure
    .query(async ({ ctx }) => {
      try {
        return {
          programId: ctx.oracleProgramId.toString(),
          defaultChannelId: DEFAULT_CHANNEL_ID,
          deviceSeed: DEVICE_SEED.toString(),
          network: ctx.connection.rpcEndpoint,
          endpoints: {
            thingSpeakApi: `https://api.thingspeak.com/channels/${DEFAULT_CHANNEL_ID}/feeds.json`,
            thingSpeakChannel: `https://thingspeak.com/channels/${DEFAULT_CHANNEL_ID}`,
          },
          constants: {
            DEVICE_SEED: "device_feed",
            DEFAULT_CHANNEL_ID,
          },
          meta: {
            fetchedAt: new Date().toISOString(),
          },
        };

      } catch (error) {
        console.error("Get oracle info error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get oracle info: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  /**
   * Check if a device feed exists
   */
  checkDeviceFeedExists: publicProcedure
    .input(deviceFeedSchema)
    .query(async ({ input, ctx }) => {
      try {
        // Derive device feed PDA
        const [deviceFeedPDA] = anchor.web3.PublicKey.findProgramAddressSync(
          [DEVICE_SEED, new anchor.BN(input.deviceId).toArrayLike(Buffer, "le", 4)],
          ctx.oracleProgramId
        );

        // Check if account exists
        const accountInfo = await ctx.connection.getAccountInfo(deviceFeedPDA);
        
        return {
          deviceId: input.deviceId,
          exists: accountInfo !== null,
          feedPDA: deviceFeedPDA.toString(),
          accountInfo: accountInfo ? {
            lamports: accountInfo.lamports,
            dataLength: accountInfo.data.length,
            owner: accountInfo.owner.toString(),
            executable: accountInfo.executable,
          } : null,
        };

      } catch (error) {
        console.error("Check device feed exists error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to check device feed existence: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),
});