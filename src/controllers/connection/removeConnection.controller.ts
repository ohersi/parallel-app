// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpDelete, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import RemoveConnectionUsecase from '@/services/usecases/connection/removeConnection.usecase';
import { sessionAuth } from '@/middleware/auth.middleware';
import { TYPES } from '@/utils/types';


@controller(`/blocks`)
export default class RemoveConnectionController {

    private readonly usecase: RemoveConnectionUsecase;

    constructor(@inject(TYPES.REMOVE_CONNECTION_USECASE) removeConnectionUsecase: RemoveConnectionUsecase) {
        this.usecase = removeConnectionUsecase;
    }

    @httpDelete('/:id/disconnect', sessionAuth)
    public async removeConnection(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const { channel } = req.query;
            const userID = req.session.user?.id!;

            if (!channel) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: "Missing channel." });
            };

            if (!userID) {
                res.status(401);
                return res.send({ error: { status: 401 }, message: `Unauthorized, no log in session.`});
            };

            const blockID = parseInt(req.params.id);
            const channelID = parseInt(channel.toString());

            const results = await this.usecase.execute(blockID, userID, channelID);

            res.status(200);
            res.send({ message: "Block has been disconnected from the channel." });
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }
}

/**
 * @openapi
 *  /blocks/{id}/disconnect:
 *   delete:
 *      security:
 *        - cookieAuth: []
 *      tags:
 *          - Block
 *      summary: Disconnect block to channel
 *      description: User must be logged in and have channel ownership to preform action
 *      operationId: removeConnection
 *      parameters:
 *        - in: path
 *          name: id
 *          schema:
 *            type: string
 *          description: ID of block to connect
 *          required: true
 *        - in: query
 *          name: channel
 *          schema:
 *            type: string
 *          description: Keyword to search
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
 *                                   example: Block has been disconnected from the channel.
 *          404:
 *              description: Missing channel query
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
 *                                   example: Missing channel.
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