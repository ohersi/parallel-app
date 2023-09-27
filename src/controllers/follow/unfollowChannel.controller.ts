// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, request, response, next, httpDelete } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import UnFollowChannelUsecase from '@/services/usecases/follow/unfollowChannel.usecase';
import { sessionAuth } from '@/middleware/auth.middleware';
import { TYPES } from '@/utils/types';

@controller(`/users`)
export default class UnFollowChannelController {

    private readonly usecase: UnFollowChannelUsecase;

    constructor(@inject(TYPES.UNFOLLOW_CHANNEL_USECASE) unfollowChannelUsecase: UnFollowChannelUsecase) {
        this.usecase = unfollowChannelUsecase;
    }

    @httpDelete('/unfollow/channel/:id', sessionAuth)
    public async unfollowChannel(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const unfollowID = parseInt(req.params.id);
            const userID = req.session.user?.id!;

            if (!unfollowID) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: "Missing channel to unfollow." });
            };

            if (!userID) {
                res.status(401);
                return res.send({ error: { status: 401 }, message: `Unauthorized, no log in session.`});
            };
            
            const results = await this.usecase.execute(userID, unfollowID);

            res.status(200);
            res.send({ message: `Channel with id [${unfollowID}] has been unfollowed.` });
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }
}

/**
 * @openapi
 *  /users/unfollow/channel/{id}:
 *   delete:
 *      security:
 *        - cookieAuth: []
 *      tags:
 *          - User
 *      summary: Unfollow channel
 *      description: User must be logged in to preform action
 *      operationId: unfollowChannel
 *      parameters:
 *        - in: path
 *          name: id
 *          schema:
 *            type: string
 *          description: ID of channel to unfollow
 *          required: true
 *      responses:
 *          200:
 *              description: Return success message
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                   type: string
 *                                   example: Channel with id [id] has been unfollowed.
 *          404:
 *              description: Missing channel id to unfollow
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
 *                                   example: Missing channel to unfollow.
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