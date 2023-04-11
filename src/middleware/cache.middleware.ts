import { redisContainer } from "../app";


// TODO: Check if there is fresh data, and return that. Otherwise return stored redis cache data
export const cache = async (key: string, callback: Function) => {

    const redisClient = redisContainer.redis;

    return new Promise((resolve, reject) => {
        redisClient.get(key, async (error, data) => {

            if (error) reject(error.message);
            if (data != null) return resolve(JSON.parse(data));

            try {
                const results = await callback();
                redisClient.setex(key, 1000, JSON.stringify(results));
                resolve(results);
            }
            catch (err: any) {
                reject(err);
            }
        })
    })
};