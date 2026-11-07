import Redis from "ioredis";

// In-memory fallback map if Redis server is not running
const memoryStore = new Map<string, { value: string; expiresAt?: number }>();

let redisClient: Redis | null = null;
let isRedisAvailable = false;

try {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    redisClient = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        retryStrategy(times) {
            if (times > 3) {
                return null; // stop retrying
            }
            return 200;
        },
        lazyConnect: true,
    });

    redisClient.on("connect", () => {
        console.log("Redis Connected");
        isRedisAvailable = true;
    });

    redisClient.on("error", (err) => {
        // Silently log and fall back to in-memory store
        isRedisAvailable = false;
    });

    redisClient.connect().catch(() => {
        isRedisAvailable = false;
    });
} catch {
    isRedisAvailable = false;
}

export const redis = {
    async get(key: string): Promise<string | null> {
        if (isRedisAvailable && redisClient) {
            try {
                return await redisClient.get(key);
            } catch {
                isRedisAvailable = false;
            }
        }
        const item = memoryStore.get(key);
        if (!item) return null;
        if (item.expiresAt && Date.now() > item.expiresAt) {
            memoryStore.delete(key);
            return null;
        }
        return item.value;
    },

    async set(key: string, value: string, mode?: string, duration?: number): Promise<"OK" | null> {
        if (isRedisAvailable && redisClient) {
            try {
                if (mode === "EX" && duration) {
                    return await redisClient.set(key, value, "EX", duration);
                }
                return await redisClient.set(key, value);
            } catch {
                isRedisAvailable = false;
            }
        }
        const expiresAt = mode === "EX" && duration ? Date.now() + duration * 1000 : undefined;
        memoryStore.set(key, { value, expiresAt });
        return "OK";
    },

    async del(key: string): Promise<number> {
        if (isRedisAvailable && redisClient) {
            try {
                return await redisClient.del(key);
            } catch {
                isRedisAvailable = false;
            }
        }
        return memoryStore.delete(key) ? 1 : 0;
    },
};

export default redis;

