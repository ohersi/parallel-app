// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpDelete, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import DeleteChannelUsecase from '@/services/usecases/channel/deleteChannel.usecase';
import { sessionAuth } from '@/middleware/auth.middleware';
import { TYPES } from '@/utils/types';


@controller(`/channels`)
export default class DeleteChannelController {

    private readonly usecase: DeleteChannelUsecase;

    constructor(@inject(TYPES.DELETE_CHANNEL_USECASE) deleteChannelUsecase: DeleteChannelUsecase) {
        this.usecase = deleteChannelUsecase;
    }

    @httpDelete('/:id', sessionAuth)
    public async deleteChannel(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const id = parseInt(req.params.id);
            const userID = req.session.user?.id!;

            if (!userID) {
                res.status(401);
                return res.send({ error: { status: 401 }, message: `Unauthorized, no log in session.` });
            }

            await this.usecase.execute(id, userID);

            res.status(200);
            res.send({ message: "Channel has been deleted." });
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
 *   delete:
 *      security:
 *        - cookieAuth: []
 *      tags:
 *          - Channel
 *      summary: Delete channel
 *      description: Delete channel
 *      operationId: deleteChannel
 *      parameters:
 *        - in: path
 *          name: id
 *          schema:
 *            type: string
 *          description: ID of channel to delete
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
 *                                   example: Channel has been deleted.
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