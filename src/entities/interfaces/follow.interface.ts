import { Channel } from "@/entities/channel.entity";
import { User } from "@/entities/user.entity";

/**
 * @openapi
 * components:
 *   schemas:
 *     ChannelsUserFollows:
 *       type: object
 *       properties:
 *         user:
 *           type: integer
 *           format: int64
 *           example: 2
 *         followed_channel:
 *           $ref: '#/components/schemas/Channel'
 *         date_created:
 *           type: string
 *           format: date
 *           example: "2020-01-01T17:00:00.000Z"
 *       xml:
 *         name: channelsuserfollows  
 *     ChannelFollowers:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/User'
 *         followed_channel:
 *           type: integer
 *           format: int64
 *           example: 4
 *         date_created:
 *           type: string
 *           format: date
 *           example: "2022-06-14T17:00:00.000Z"
 *       xml:
 *         name: channelfollowers
 *     UserFollowers:
 *       type: object
 *       properties:
 *           following_user:
 *              allOf:
 *                - $ref: '#/components/schemas/User'
 *              example:
 *                 id: 20
 *                 slug: following-user
 *                 first_name: following
 *                 last_name: user
 *                 full_name: Following User
 *                 email: following@email.com
 *                 avatar: image.jpg
 *                 following_count: 1
 *                 follower_count: 1
 *                 role: user
 *                 enabled: true
 *                 locked: false
 *           followed_user:
 *             type: integer
 *             format: int64
 *             example: 2
 *           date_created:
 *             type: string
 *             format: date
 *             example: "2023-02-12T17:00:00.000Z"
 *       xml:
 *         name: userfollowers   
 *     UserFollowing:
 *       type: object
 *       properties:
 *           following_user:
 *             type: integer
 *             format: int64
 *             example: 4
 *           followed_user:
 *              allOf:
 *                - $ref: '#/components/schemas/User'
 *              example:
 *                 id: 20
 *                 slug: followed-user
 *                 first_name: followed
 *                 last_name: user
 *                 full_name: Followed User
 *                 email: followed@email.com
 *                 avatar: image.jpg
 *                 following_count: 2
 *                 follower_count: 2
 *                 role: user
 *                 enabled: true
 *                 locked: false
 *           date_created:
 *             type: string
 *             format: date
 *             example: "2019-04-15T17:00:00.000Z"
 *       xml:
 *         name: userfollowing
*/
export default interface IFollow {
    user: User;
    followed_channel: Channel;
    date_created: Date;
}