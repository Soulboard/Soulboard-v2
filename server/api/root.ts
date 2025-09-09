
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { contractsRouter } from "@/server/api/routers/contracts";
import { providerRouter } from "@/server/api/routers/provider";
import { campaignsRouter } from "@/server/api/routers/campaigns";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  contracts: contractsRouter,
  provider: providerRouter,
  campaigns: campaignsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);