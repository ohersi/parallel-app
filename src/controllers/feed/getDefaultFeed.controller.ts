// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import GetDefaultFeedUsecase from '@/services/usecases/feed/getDefaultFeed.usecase';
import { cache } from '@/resources/caching/cache';
import { TYPES } from '@/utils/types';
import { decodeLastID } from '@/resources/helper/text-manipulation';
import { paginate } from '@/middleware/paginate.middlware';


@controller(`/feed`)
export default class GetDefaultFeedController {

    private readonly usecase: GetDefaultFeedUsecase;

    constructor(@inject(TYPES.GET_DEFAULT_FEED_USECASE) getDefaultFeedUsecase: GetDefaultFeedUsecase) {
        this.usecase = getDefaultFeedUsecase;
    }

    @httpGet('/', paginate)
    public async getDefaultFeed(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {

            const channel_lastID = decodeLastID(req.query.channel_lastID as string);
            const block_lastID = decodeLastID(req.query.block_lastID as string);
            const limit = parseInt(req.query.limit as string);

            const results = await this.usecase.execute(channel_lastID, block_lastID, limit);

            if (!results) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: 'Feed could not be generated.' });
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
 *  /feed:
 *   get:
 *      tags:
 *          - Feed
 *      summary: Get default feed
 *      description: Returns an array of feed items
 *      operationId: getDefaultFeed
 *      parameters:
 *        - in: query
 *          name: channel_lastID
 *          schema:
 *            type: string
 *          description: Last channel id for pagination
 *          required: false
 *        - in: query
 *          name: block_lastID
 *          schema:
 *            type: string
 *          description: Last block id for pagination
 *          required: false
 *        - in: query
 *          name: limit
 *          schema:
 *            type: string
 *          description: Limit number of results to return
 *          required: false
 *      responses:
 *          200:
 *              description: Return feed
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              total:
 *                                   type: integer
 *                                   format: int64
 *                                   example: 2
 *                              channel_total:
 *                                   type: integer
 *                                   format: int64
 *                                   example: 1
 *                              block_total:
 *                                   type: integer
 *                                   format: int64
 *                                   example: 1
 *                              channel_lastID:
 *                                   type: object
 *                                   oneOf:
 *                                     - type: string
 *                                     - type: integer
 *                                   example: null
 *                              block_lastID:
 *                                   type: object
 *                                   oneOf:
 *                                     - type: string
 *                                     - type: integer
 *                                   example: null
 *                              data:
 *                                  type: array
 *                                  items:
 *                                     allOf:
 *                                        - $ref: '#/components/schemas/Block'
 *                                        - type: object
 *                                          required:
 *                                             - channels
 *                                          properties:
 *                                            channels:
 *                                              type: array
 *                                              items:
 *                                               anyOf:
 *                                                - $ref: '#/components/schemas/Channel'
 *                                              example:
 *                                                - id: 2
 *                                                  user:
 *                                                     id: 1
 *                                                     slug: first-user
 *                                                     first_name: First
 *                                                     last_name: User 
 *                                                     full_name: First User
 *                                                  title: Channel 2
 *                                                  description: example description
 *                                                  slug: channel-2
 *                                                  follower_count: 6
 *                                                  date_created: 2020-02-01T17:00:00.000Z
 *                                                  date_updated: 2020-02-01T17:00:00.000Z  
 *          404:
 *              description: Feed could not be generated.
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
 *                                   example: Feed could not be generated.
 *          500:
 *              description: Server error
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: '#/components/schemas/ServerError'
 */