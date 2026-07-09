import dotenv from "dotenv";
dotenv.config({ path: "./backend/.env" });

import Redis from "ioredis";

// Create a Redis client using Upstash Redis URL from environment variables
export const redis = new Redis(process.env.UPSTASH_REDIS_URL, {
	tls: { rejectUnauthorized: false },
	maxRetriesPerRequest: null,
	enableReadyCheck: false,
});
