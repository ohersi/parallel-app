/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *           id:
 *             type: integer
 *             format: int64
 *             example: 1
 *           slug:
 *             type: string
 *             example: test-user-1
 *           first_name:
 *             type: string
 *             example: Test
 *           last_name:
 *             type: string
 *             example: User 1
 *           full_name:
 *             type: string
 *             example: Test User 1
 *           email:
 *             type: string
 *             example: test@email.com
 *           avatar:
 *             type: string
 *             example: image.jpg
 *           following_count:
 *             type: integer
 *             format: int64
 *             example: 0
 *           follower_count:
 *             type: integer
 *             format: int64
 *             example: 0
 *           role:
 *             type: string
 *             example: user
 *           enabled:
 *             type: boolean
 *             example: true
 *           locked:
 *             type: boolean
 *             example: false
 *       xml:
 *         name: user
*/
export default interface IUser {
    id: number;
    slug: string;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    password: string;
    avatar: string;
    role: string;
}