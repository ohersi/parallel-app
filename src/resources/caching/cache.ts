import { redisContainer } from "@/app";
import { convertTime } from "@/resources/helper/convert-time";

export const cache = async (key: string, callback: Function, duration: string) => {

    const redisClient = redisContainer.redis;
    
    const convertedTime = convertTime(duration);

    return new Promise((resolve, reject) => {
        redisClient.get(key, async (error, data) => {

            if (error) reject(error.message);
            if (data != null) return resolve(JSON.parse(data));

            try {
                const results = await callback();
                redisClient.setex(key, convertedTime, JSON.stringify(results));
                resolve(results);
            }
            catch (err: any) {
                reject(err);
            }
        })
    })
};