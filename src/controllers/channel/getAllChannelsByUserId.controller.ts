// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import GetAllChannelsByUserIdUsecase from '@/services/usecases/channel/getAllChannelsByUserId.usecase';
import { TYPES } from '@/utils/types';
import { TYPES_ENUM } from '@/utils/types/enum';
import { sessionAuth, roleAuth } from '@/middleware/auth.middleware';
import { cache } from '@/resources/caching/cache';
import { paginate } from '@/middleware/paginate.middlware';

@controller(`/channels`)
export default class GetAllChannelsByUserIdController {

    private readonly usecase: GetAllChannelsByUserIdUsecase;

    constructor(@inject(TYPES.GET_ALL_CHANNELS_BY_USER_ID_USECASE) getAllChannelsByUserID: GetAllChannelsByUserIdUsecase) {
        this.usecase = getAllChannelsByUserID;
    }

    @httpGet('/user/:id', paginate)
    public async getAllChannelsByUserID(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const userID = parseInt(req.params.id);
            const limit = parseInt(req.query.limit as string);
            const cacheTimespan = '15mins';
            
            const results: any = await cache(`user:${userID}:channels:limit=${limit}`, () => this.usecase.execute(userID, limit), cacheTimespan);

            if (Array.isArray(results.data) && !results.data.length) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: `User with id [${userID}] has no channels.` });
            }
            else {
                res.status(200);
                res.send(results);
            }
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }
}

/**
 * @openapi
 *  /channels/user/{id}:
 *   get:
 *      tags:
 *          - Channel
 *      summary: Find all channels by user ID
 *      description: Returns all user channels
 *      operationId: getAllChannelsByUserID
 *      parameters:
 *        - in: path
 *          name: id
 *          schema:
 *            type: string
 *          description: ID of user to search
 *          required: true
 *      responses:
 *          200:
 *              description: Return all user channels
 *              content:
 *                  application/json:
 *                     schema:
 *                      type: array
 *                      items:
 *                         $ref: '#/components/schemas/ChannelPageResults'
 *          404:
 *              description: Channels not found from particular user
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
 *                                   example: User with id [id] has no channels.
 *          500:
 *              description: Server error
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: '#/components/schemas/ServerError'
 */