// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import GetChannelFollowersUsecase from '@/services/usecases/channel/getChannelFollowers.usecase';
import { cache } from '@/resources/caching/cache';
import { TYPES } from '@/utils/types';


@controller(`/channels`)
export default class GetChannelFollowersController {

    private readonly usecase: GetChannelFollowersUsecase;

    constructor(@inject(TYPES.GET_CHANNEL_FOLLOWERS_USECASE) getChannelFollowersUsecase: GetChannelFollowersUsecase) {
        this.usecase = getChannelFollowersUsecase;
    }

    @httpGet('/:slug/followers')
    public async getChannelFollowers(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const slug = req.params.slug;
            const cacheTimespan = '60s';
            
            const results: any = await cache(`channel:${slug}:users:followers`, () => this.usecase.execute(slug), cacheTimespan);
            
            if (!results) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: `No channel was found with that slug.` });
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
 *  /channels/{slug}/followers:
 *   get:
 *      tags:
 *          - Channel
 *      summary: Find all user that user follows channel by channel slug
 *      description: Returns all user following particular channel
 *      operationId: getChannelFollowers
 *      parameters:
 *        - in: path
 *          name: slug
 *          schema:
 *            type: string
 *          description: slug of channel to search
 *          required: true
 *      responses:
 *          200:
 *              description: Return all users following channel
 *              content:
 *                  application/json:
 *                     schema:
 *                      type: array
 *                      items:
 *                         $ref: '#/components/schemas/ChannelFollowers'
 *                      example:  
 *                        - user:
 *                            id: 1
 *                            slug: first-user
 *                            first_name: first
 *                            last_name: user
 *                            full_name: First User
 *                            email: first@email.com
 *                            avatar: image.jpg
 *                            following_count: 5
 *                            follower_count: 1
 *                            role: user
 *                            enabled: true
 *                            locked: false
 *                          followed_channel: 5
 *                          date_created: 2022-01-02T17:00:00.000Z 
 *                        - user:
 *                            id: 2
 *                            slug: second-user
 *                            first_name: second
 *                            last_name: user
 *                            full_name: Second User
 *                            email: second@email.com
 *                            avatar: image.jpg
 *                            following_count: 2
 *                            follower_count: 2
 *                            role: user
 *                            enabled: true
 *                            locked: false
 *                          followed_channel: 5
 *                          date_created: 2022-01-03T17:00:00.000Z 
 *          404:
 *              description: No channel found
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
 *                                   example: No channel was found with that slug.
 *          500:
 *              description: Server error
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: '#/components/schemas/ServerError'
 */