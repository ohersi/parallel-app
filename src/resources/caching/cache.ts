import { redisContainer } from "@/app";
import { convertTime } from "@/resources/helper/convert-time";
import { ActivityData } from "@/services/usecases/feed/addToFeed.usecase";

export const cache = async (key: string, callback: Function, duration: string) => {

    const redisClient = redisContainer.redis;

    const convertedTime = convertTime(duration);

    return new Promise((resolve, reject) => {
        redisClient.get(key, async (error, data) => {

            if (error) reject(error.message);
            if (data != null) return resolve(JSON.parse(data));

            try {
                const results = await callback();
                if (results != null) redisClient.set(key, JSON.stringify(results), "EX", convertedTime);
                resolve(results);
            }
            catch (err: any) {
                reject(err);
            }
        })
    })
};

export const getFeed = async (userID: number) => {

    const redisClient = redisContainer.redis;

    const key = `user:${userID}:feed`;

    // Get user feed
    let arr: any[] = [];

    return new Promise<ActivityData[] | any[]>((resolve, reject) => {
        redisClient.zrevrange(key, 0, -1, async (error, data) => {

            if (error) reject(error.message);

            if (data == undefined) return resolve(arr);

            for (const res of data) {
                arr.push(JSON.parse(res))
            }
            resolve(arr as ActivityData[]);
        })
    })
};

export const update = async (type: string, id: number, data: any, duration: string) => {

    const redisClient = redisContainer.redis;

    const key = `${type}:${id}`;

    const convertedTime = convertTime(duration);

    redisClient.set(key, JSON.stringify(data), "EX", convertedTime);
};

export const updateFollowers = (userID: number, callback: Function) => {

    const redisClient = redisContainer.redis;

    const key = `user:${userID}:followers`;

    return new Promise((resolve, reject) => {
        redisClient.get(key, async (error, data) => {

            if (error) reject(error.message);

            try {
                // Update follower cache / create if none exists
                const results = await callback();
                await redisClient.set(key, JSON.stringify(results));
                resolve({ success: true });
            }
            catch (err: any) {
                reject(err);
            }
        })
    })
}