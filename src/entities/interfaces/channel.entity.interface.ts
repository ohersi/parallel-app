/**
 * @openapi
 * components:
 *   schemas:
 *     Channel:
 *       type: object
 *       properties:
 *           id:
 *             type: integer
 *             format: int64
 *             example: 1
 *           user:
 *              oneOf:
 *                - type: integer
 *                - type: object
 *              example: 2
 *           title:
 *             type: string
 *             example: Test Channel 1
 *           description:
 *             type: string
 *             example: example description
 *           slug:
 *             type: string
 *             example: test-channel-1
 *           follower_count:
 *             type: integer
 *             format: int64
 *             example: 5
 *           date_created:
 *             type: string
 *             format: date
 *             example: 2020-01-01T17:00:00.000Z
 *           date_updated:
 *             type: string
 *             format: date
 *             example: 2020-01-01T17:00:00.000Z
 *       xml:
 *         name: channel
*/
export default interface IChannel {
    id: number;
    user: number;
    title: string;
    description: string;
    slug: string;
    blocks: any;
    follower_count: number;
    date_created: Date;
    date_updated: Date;
} 