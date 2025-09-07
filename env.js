import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    server : { 
            NODE_ENV: z.enum(["development", "production"]),
    },
    client: {
                NEXT_PUBLIC_CROSSMINT_API_KEY: z.string(),
                NEXT_PUBLIC_RPC_URL: z.string().url(),
                NEXT_PUBLIC_USDC_TOKEN_MINT: z.string(),
    }
               
})