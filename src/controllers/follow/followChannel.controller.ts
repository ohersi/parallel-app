// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpPost, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import FollowChannelUsecase from '@/services/usecases/follow/followChannel.usecase';
import { sessionAuth } from '@/middleware/auth.middleware';
import { TYPES } from '@/utils/types';

@controller(`/users`)
export default class FollowChannelController {

    private readonly usecase: FollowChannelUsecase;

    constructor(@inject(TYPES.FOLLOW_CHANNEL_USECASE) followChannelUsecase: FollowChannelUsecase) {
        this.usecase = followChannelUsecase;
    }

    @httpPost('/follow/channel/:id', sessionAuth)
    public async followChannel(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const followID = parseInt(req.params.id);
            const userID = req.session.user?.id!;

            if (!followID) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: "Missing channel to follow." });
            };

            if (!userID) {
                res.status(401);
                return res.send({ error: { status: 401 }, message: `Unauthorized, no log in session.`});
            };

            const results = await this.usecase.execute(userID, followID);

            res.status(200);
            res.send({ message: `Following channel with id [${followID}].` });
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }
}

/**
 * @openapi
 *  /users/follow/channel/{id}:
 *   post:
 *      security:
 *        - cookieAuth: []
 *      tags:
 *          - Follow
 *      summary: Follow channel
 *      description: Logged in user follows channel
 *      operationId: followChannel
 *      parameters:
 *        - name: id
 *          in: path
 *          description: ID of channel to follow
 *          required: true
 *      responses:
 *          200:
 *              description: Return success status message
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                   type: string
 *                                   example: Following channel with id [id].
 *          404:
 *              description: Missing channel id to follow
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
 *                                   example: Missing channel to follow.
 *          401:
 *              description: Not authorized to make changes
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
 *                                          example: 401
 *                              message:
 *                                   type: string
 *                                   example: Unauthorized, no log in session.
 *          500:
 *              description: Server error
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: '#/components/schemas/ServerError'
 */