// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import GetAllChannelsUsecase from '@/services/usecases/channel/getAllChannels.usecase';
import { TYPES } from '@/utils/types';
import { cache } from '@/resources/caching/cache';


@controller(`/channels`)
export default class GetAllChannelsController {

    private readonly usecase: GetAllChannelsUsecase;

    constructor(@inject(TYPES.GET_ALL_CHANNELS_USECASE) getAllChannelsUsecase: GetAllChannelsUsecase) {
        this.usecase = getAllChannelsUsecase;
    }

    @httpGet('/')
    public async getAllChannels(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const cacheTimespan = '15mins';

            const results = await cache('channels', this.usecase.execute, cacheTimespan);

            if (Array.isArray(results) && !results.length) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: 'No channels found.' });
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
 *  /channels:
 *   get:
 *      tags:
 *          - Channel
 *      summary: Get all channels
 *      description: Returns all channels
 *      operationId: getAllChannels
 *      responses:
 *          200:
 *              description: Return an array of all channels
 *              content:
 *                  application/json:
 *                     schema:
 *                      type: array
 *                      items:
 *                        $ref: '#/components/schemas/Channel'
 *                      example:
 *                        - id: 1
 *                          user: 2
 *                          title: Channel 1
 *                          description: example description
 *                          slug: channel-1
 *                          follower_count: 2
 *                          date_created: 2020-01-01T17:00:00.000Z
 *                          date_updated: 2020-01-01T17:00:00.000Z
 *                        - id: 2
 *                          user:
 *                               id: 1
 *                               slug: first-user
 *                               first_name: First
 *                               last_name: User 
 *                               full_name: First User
 *                          title: Channel 2
 *                          description: example description
 *                          slug: channel-2
 *                          follower_count: 6
 *                          date_created: 2020-02-01T17:00:00.000Z
 *                          date_updated: 2020-02-01T17:00:00.000Z
 *          404:
 *              description: Channel not found
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
 *                                   example: No channels found.
 *          500:
 *              description: Server error
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: '#/components/schemas/ServerError'
 */