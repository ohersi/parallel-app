// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import GetAllChannelsUserFollowsUsecase from '@/services/usecases/channel/getAllChannelsUserFollows.usecase';
import { cache } from '@/resources/caching/cache';
import { TYPES } from '@/utils/types';

@controller(`/users`)
export default class GetAllChannelsUserFollowsController {

    private readonly usecase: GetAllChannelsUserFollowsUsecase;

    constructor(@inject(TYPES.GET_ALL_CHANNELS_USER_FOLLOWS_USECASE) getAllChannelsUserFollowsUsecase: GetAllChannelsUserFollowsUsecase) {
        this.usecase = getAllChannelsUserFollowsUsecase;
    }

    @httpGet('/:slug/following')
    public async getAllChannelsUserFollows(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const slug = req.params.slug;
            const cacheTimespan = '60s';
            
            const results: any = await cache(`user:${slug}:channels:following`, () => this.usecase.execute(slug), cacheTimespan);

            if (Array.isArray(results) && !results.length) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: `User not following any channels.` });
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
 *  /users/{slug}/following:
 *   get:
 *      tags:
 *          - Follow
 *      summary: Find all channels that user follows by user slug
 *      description: Returns all channels user follows
 *      operationId: getAllChannelsUserFollows
 *      parameters:
 *        - name: slug
 *          in: path
 *          description: slug of user to search
 *          required: true
 *      responses:
 *          200:
 *              description: Return all channels user follows
 *              content:
 *                  application/json:
 *                     schema:
 *                      type: array
 *                      items:
 *                         $ref: '#/components/schemas/ChannelsUserFollows'
 *                      example: 
 *                        - user: 2
 *                          followed_channel:
 *                              id: 2
 *                              user: 1
 *                              title: Channel 2
 *                              description: example description
 *                              slug: channel-2
 *                              follower_count: 2
 *                              date_created: 2020-01-01T17:00:00.000Z
 *                              date_updated: 2020-01-01T17:00:00.000Z
 *                          date_created: 2022-01-01T17:00:00.000Z 
 *                        - user: 2
 *                          followed_channel:
 *                              id: 1
 *                              user: 6
 *                              title: Chann3l 6
 *                              description: example description
 *                              slug: channel-6
 *                              follower_count: 10
 *                              date_created: 2020-01-01T17:00:00.000Z
 *                              date_updated: 2020-01-01T17:00:00.000Z
 *                          date_created: 2022-01-02T17:00:00.000Z 
 *          404:
 *              description: User not following any channels
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
 *                                   example: User not following any channels.
 *          500:
 *              description: Server error
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: '#/components/schemas/ServerError'
 */