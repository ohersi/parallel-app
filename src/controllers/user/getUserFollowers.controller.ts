// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify'
// Imports
import GetUserFollowersUsecase from '@/services/usecases/user/getUserFollowers.usecase';
import { cache } from '@/resources/caching/cache';
import { TYPES } from '@/utils/types';

@controller(`/users`)
export default class GetUserFollowersController {

    private readonly usecase: GetUserFollowersUsecase;

    constructor(@inject(TYPES.GET_USER_FOLLOWERS_USECASE) getUserFollowersUsecase: GetUserFollowersUsecase) {
        this.usecase = getUserFollowersUsecase;
    }

    @httpGet('/:slug/followers')
    public async getUserFollowers(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const slug = req.params.slug;
            const cacheTimespan = '60s';

            const results = await cache(`user:${slug}:followers`, () => this.usecase.execute(slug), cacheTimespan);

            if ((Array.isArray(results) && !results.length) || !results) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: `User with slug [${slug}] has no followers.` });
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
 *  /users/{slug}/followers:
 *   get:
 *      tags:
 *          - User
 *      summary: Find all user followers by slug
 *      description: Returns all users following particular user
 *      operationId: getUserFollowers
 *      parameters:
 *        - in: path
 *          name: slug
 *          schema:
 *            type: string
 *          description: slug of user to search
 *          required: true
 *      responses:
 *          200:
 *              description: Return an array of all user followers, and timestamp
 *              content:
 *                  application/json:
 *                     schema:
 *                      type: array
 *                      items:
 *                       anyOf:
 *                          - $ref: '#/components/schemas/UserFollowers'
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
 *                                   example: User with slug [slug] has no followers.
 *          500:
 *              description: Server error
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: '#/components/schemas/ServerError'
 */