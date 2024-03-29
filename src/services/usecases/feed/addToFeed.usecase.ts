// Packages
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
// Imports
import { redisContainer } from "@/app";
import { User } from "@/entities/user.entity";
import { Friend } from "@/entities/friend.entity";
import UserRepository from "@/repositories/user.repository";
import FriendRepository from "@/repositories/friend.repository";
import { TYPES } from "@/utils/types";

export type ActivityData = {
    user: {
        id: number,
        full_name?: string | null,
        slug?: string | null,
        avatar?: string | null,
    }
    timestamp: Date
    data_type: string
    action_type: string
    data: any
}

@provide(TYPES.ADD_TO_FEED_USECASE)
export default class AddToFeedUsecase {

    private friendRepository: FriendRepository;
    private userRepository: UserRepository;

    constructor(
        @inject(TYPES.FRIEND_REPOSITORY) friendRepository: FriendRepository,
        @inject(TYPES.USER_REPOSITORY) userRepository: UserRepository,
    ) {
        this.friendRepository = friendRepository;
        this.userRepository = userRepository;
    }

    /*
      userID: user performing action
      data_type: enum (ex. 'CHANNEL', 'USER')
      data_type: enum (ex. 'CREATED', 'CONNECTED', 'FOLLOWED')
      data: action results as data object

      SORTED SET:  <key> <timestamp> <data>  

            key = `user:{followerID}:feed`
            timestamp = new Date()
            data = ActivityData {
                userID; - user doing the action
                timestamp;
                data_type: TYPE.ACTIVITY_DATA e.g. Channel, User
                action_type: ACTIVITY.ACTION e.g. CREATED, CONNECTED, FOLLOWED
                data: Object - e.g. Channel followed, user followed, etc
            }
    */

    public execute = async (
        userID: number,
        data_type: string,
        action_type: string,
        data: any,
        timestamp: Date
    ) => {

        const redisClient = redisContainer.redis;

        try {
            let followers: Friend[] = [];

            // Check redis cache for user followers - {userID}:followers
            const cachedFollowers = await redisClient.get(`user:${userID}:followers`);

            // If cache not found, get all user followers in db
            if (cachedFollowers === null) {
                console.log('CACHE MISS')
                const foundFollowers = await this.friendRepository.findAllFollowers(userID);
                // Add to redis
                await redisClient.set(`user:${userID}:followers`, JSON.stringify(foundFollowers));
                followers = foundFollowers;
            }
            else {
                followers = JSON.parse(cachedFollowers);
                console.log('CACHE HIT')
            }

            let redisObject: ActivityData = {
                user: {
                    id: userID,
                },
                timestamp: timestamp,
                data_type: data_type,
                action_type: action_type,
                data: data
            };

            let ids: number[] = [];
            for (const follower of followers) {
                ids.push(follower.following_user.id);
            }
            // Add user's own ID so their activity are pushed to their feed
            ids.push(userID);

            // Insert activity into followees feed set
            for (const id of ids) {
                await redisClient.zadd(`user:${id}:feed`, Date.now(), JSON.stringify(redisObject));

                const setCount = await redisClient.zcard(`user:${id}:feed`);

                // Capping set to 10 items for testing, prod set capped at 100
                if (setCount > 10) {
                    await redisClient.zremrangebyrank(`user:${id}:feed`, 0, -10);
                }
            }
        }
        catch (err: any) {
            throw new Error(err.message);
        }
    }
}

/**
 * @openapi
 * components:
 *   schemas:
 *      Feed:
 *        type: object
 *        properties:
 *            user:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 format: int64
 *                 example: 1
 *               slug:
 *                 type: string
 *                 example: test-user-1
 *               first_name:
 *                 type: string
 *                 example: Test
 *               last_name:
 *                 type: string
 *                 example: User 1
 *               full_name:
 *                 type: string
 *                 example: Test User 1
 *            timestamp:
 *              type: string
 *              format: date
 *              example: 2020-01-01T17:00:00.000Z
 *            data_type:
 *              type: string
 *              example: Block
 *            action_type:
 *              type: string
 *              example: Connected
 *            data:
 *                type: object 
 *        xml:
 *          name: feed
*/