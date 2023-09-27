// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify'
// Imports
import GetUserFriendsUsecase from '@/services/usecases/user/getUserFriends.usecase';
import { cache } from '@/resources/caching/cache';
import { TYPES } from '@/utils/types';

@controller(`/users`)
export default class GetUserFriendsController {

    private readonly usecase: GetUserFriendsUsecase;

    constructor(@inject(TYPES.GET_USER_FRIENDS_USECASE) getUserFriendUsecase: GetUserFriendsUsecase) {
        this.usecase = getUserFriendUsecase;
    }

    @httpGet('/:slug/following/users')
    public async getUserFriends(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const slug = req.params.slug;
            const cacheTimespan = '60s';
            
            const results = await cache(`user:${slug}:following`, () => this.usecase.execute(slug), cacheTimespan);

            if (Array.isArray(results) && !results.length) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: `User with slug [${slug}] is not following anyone.`});
            }
            res.status(200);
            res.send(results);
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }
}

/**
 * @openapi
 *  /users/{slug}/following/users:
 *   get:
 *      tags:
 *          - User
 *      summary: Find all users that a user follows by slug
 *      description: Returns all users that a particular user follows
 *      operationId: getUserFriends
 *      parameters:
 *        - in: path
 *          name: slug
 *          schema:
 *            type: string
 *          description: slug of user to search
 *          required: true
 *      responses:
 *          200:
 *              description: Return an array of all users that the queried user follows, and timestamp
 *              content:
 *                  application/json:
 *                     schema:
 *                      type: array
 *                      items:
 *                       anyOf:
 *                          - $ref: '#/components/schemas/UserFollowing'
 *          404:
 *              description: No user found
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              error:
 *                                  type: object
 *                                  properties:
 *                                      status:
 *                                          type: string
 *                                          example: 404
 *                              message:
 *                                   type: string
 *                                   example: User with slug [${slug}] is not following anyone.
 *          500:
 *              description: Server error
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: '#/components/schemas/ServerError'
 */