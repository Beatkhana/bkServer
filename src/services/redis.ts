import { createClient, RedisClientType } from "redis";
let redisClient: RedisClientType;

export class RedisService {
    static async initRedis() {
        redisClient = createClient({
            url: "redis://127.0.0.1:6379"
        }) as RedisClientType;
        await redisClient.connect();
        redisClient.on("error", err => {
            console.error("Redis Client Error: ", err);
        });
    }

    /**
     * @param {string} key - The key to set
     * @param {*} value - The value to set
     * @param {number} [expire=3600]  - The number of seconds until the key expires
     */
    public static async set(key: string, value: any, expire = 3600): Promise<void> {
        redisClient.set(key, JSON.stringify(value), {
            EX: expire
        });
        return;
    }

    public static async setNoEx(key: string, value: any): Promise<void> {
        redisClient.set(key, JSON.stringify(value));
        return;
    }

    public static async get<T>(key: string): Promise<T | null> {
        const data = await redisClient.get(key);
        if (!data) return null;
        const obj = JSON.parse(data);
        return obj;
    }
}
