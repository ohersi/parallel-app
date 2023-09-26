// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import getChannelBySlugUsecase from '@/services/usecases/channel/getChannelBySlug.usecase';
import { convertToSlug, decodeLastID } from '@/resources/helper/text-manipulation';
import { paginate } from '@/middleware/paginate.middlware';
import { TYPES } from '@/utils/types';


@controller(`/channels`)
export default class GetChannelBySlugController {

    private readonly usecase: getChannelBySlugUsecase;

    constructor(@inject(TYPES.GET_CHANNEL_BY_SLUG_USECASE) getChannelBySlugUsecase: getChannelBySlugUsecase) {
        this.usecase = getChannelBySlugUsecase;
    }

    @httpGet('/title/:slug', paginate)
    public async getChannelBySlug(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const channelSlug = convertToSlug(req.params.slug);
            const last_id = decodeLastID(req.query.last_id as string);
            const limit = parseInt(req.query.limit as string);

            if (!last_id) throw new Error('Cannot convert last_id');

            const results = await this.usecase.execute(channelSlug, last_id, limit);

            if (!results) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: `Channel with title [${channelSlug}] was not found.` });
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
 *  /channels/title/{slug}:
 *   get:
 *      tags:
 *          - Channel
 *      summary: Find channel By slug
 *      description: Returns a single channel
 *      operationId: getChannelBySlug
 *      parameters:
 *        - name: slug
 *          in: path
 *          description: slug of channel to return
 *          required: true
 *        - in: query
 *          name: last_id
 *          description: Last block id for pagination
 *          required: false
 *        - in: query
 *          name: limit
 *          description: Limit number of blocks
 *          required: false
 *      responses:
 *          200:
 *              description: Return channel
 *              content:
 *                  application/json:
 *                     schema:
 *                        type: object
 *                        properties:
 *                           total:
 *                              type: integer
 *                              format: int64
 *                              example: 0
 *                           last_id:
 *                               oneOf:
 *                                 - integer
 *                                 - string
 *                               example: null
 *                           data:
 *                             allOf:
 *                               - $ref: '#/components/schemas/Channel'
 *                               - type: object
 *                                 required:
 *                                    - block
 *                                 properties:
 *                                   block:
 *                                     type: array
 *                                     example: []
 *                                   user:
 *                                     type: object
 *                                     example:
 *                                      id: 1
 *                                      slug: first-user
 *                                      full_name: First User
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
 *                                   example: Channel with title [slug] was not found.
 *          500:
 *              description: Server error
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: '#/components/schemas/ServerError'
 */