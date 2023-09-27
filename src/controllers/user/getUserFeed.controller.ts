// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import GetUserFeedUsecase from '@/services/usecases/feed/getUserFeed.usecase';
import { getFeed } from '@/resources/caching/cache';
import { TYPES } from '@/utils/types';

@controller(`/feed`)
export default class GetUserFeedController {
    
    private readonly usecase: GetUserFeedUsecase;

    constructor(@inject(TYPES.GET_USER_FEED_USECASE) getUserFeedUsecase: GetUserFeedUsecase) {
        this.usecase = getUserFeedUsecase;
    }
    
    @httpGet('/user/:id')
    public async getUserFeed(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const id = parseInt(req.params.id);
            
            const cachedFeed = await getFeed(id);
        
            if (Array.isArray(cachedFeed) && !cachedFeed.length) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: `User ${id} has no feed.` });
            }

            const results = await this.usecase.execute(cachedFeed);

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
 *  /feed/user/{id}:
 *   get:
 *      tags:
 *          - Feed
 *      summary: Get user feed
 *      description: Returns an array of feed items
 *      operationId: getUserFeed
 *      parameters:
 *        - in: path
 *          name: id
 *          schema:
 *            type: string
 *          description: ID of user to search
 *          required: true
 *      responses:
 *          200:
 *              description: Return an array of feed items, expanded user object, data and action type, and timestamp
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                            allOf:
 *                               - $ref: '#/components/schemas/Feed'
 *                               - type: object
 *                                 required:
 *                                   - data
 *                                 properties: 
 *                                  data:
 *                                    type: object
 *                                    properties:
 *                                      block:
 *                                        allOf:
 *                                          - $ref: '#/components/schemas/Block'
 *                                          - type: object
 *                                            required:
 *                                               - channels
 *                                            properties:
 *                                              channels:
 *                                                type: array
 *                                                items:
 *                                                 anyOf:
 *                                                  - $ref: '#/components/schemas/Channel'
 *                                                example:
 *                                                  - id: 2
 *                                                    user: 5
 *                                                    title: Channel 8
 *                                                    description: example description
 *                                                    slug: channel-8
 *                                                    follower_count: 7
 *                                                    date_created: 2020-02-01T17:00:00.000Z
 *                                                    date_updated: 2020-02-01T17:00:00.000Z
 *                                      channel:
 *                                        type: object
 *                                        items:
 *                                          $ref: '#/components/schemas/Channel'
 *                                        example:
 *                                          id: 2
 *                                          user:
 *                                               id: 1
 *                                               slug: first-user
 *                                               first_name: First
 *                                               last_name: User 
 *                                               full_name: First User
 *                                               avatar: image.jpg
 *                                          title: Channel 2
 *                                          description: example description
 *                                          slug: channel-2
 *                                          follower_count: 6
 *                                          date_created: 2020-02-01T17:00:00.000Z
 *                                          date_updated: 2020-02-01T17:00:00.000Z
 *                                          blocks: []
 *                                          users_following: []              
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