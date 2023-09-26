// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import GetChannelByIdUsecase from '@/services/usecases/channel/getChannelById.usecase';
import { decodeLastID } from '@/resources/helper/text-manipulation';
import { paginate } from '@/middleware/paginate.middlware';
import { TYPES } from '@/utils/types';


@controller(`/channels`)
export default class GetChannelByIdController {

    private readonly usecase: GetChannelByIdUsecase;

    constructor(@inject(TYPES.GET_CHANNEL_BY_ID_USECASE) getChannelByIdUsecase: GetChannelByIdUsecase) {
        this.usecase = getChannelByIdUsecase;
    }

    @httpGet('/:id', paginate)
    public async getChannelByID(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const channelID = parseInt(req.params.id);
            const last_id = decodeLastID(req.query.last_id as string);
            const limit = parseInt(req.query.limit as string);

            if (!last_id) throw new Error('Cannot convert last_id');

            const results = await this.usecase.execute(channelID, last_id, limit);

            if (!results.data) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: `No channels found with that [${channelID}].` });
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
 *  /channels/{id}:
 *   get:
 *      tags:
 *          - Channel
 *      summary: Find channel By ID
 *      description: Returns a single channel
 *      operationId: getChannelByID
 *      parameters:
 *        - name: id
 *          in: path
 *          description: ID of channel to return
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
 *                                   example: No channels found with that [id].
 *          500:
 *              description: Server error
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: '#/components/schemas/ServerError'
 */