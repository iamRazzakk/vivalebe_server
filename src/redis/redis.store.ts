// need to store the authentication data in redis
import Redis from "ioredis";
import redisClient from "../config/redis.config";


export const dataStoreToRedis =
    async (key: string, value: string, expiration: number) => {
        await redisClient.set(key, value, "EX", expiration);
    };



export const dataGetFromRedis = async (key: string) => {
    return await redisClient.get(key);
};

// delete data from redis
export const dataDeleteFromRedis = async (key: string) => {
    await redisClient.del(key);
};