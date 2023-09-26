// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpPost, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import AddConnectionUsecase from '@/services/usecases/connection/addConnection.usecase';
import { sessionAuth } from '@/middleware/auth.middleware';
import { TYPES } from '@/utils/types';


@controller(`/blocks`)
export default class AddConnectionController {

    private readonly usecase: AddConnectionUsecase;

    constructor(@inject(TYPES.ADD_CONNECTION_USECASE) addConnectionUsecase: AddConnectionUsecase) {
        this.usecase = addConnectionUsecase;
    }

    @httpPost('/:id/connect', sessionAuth)
    public async addConnection(
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
 *  /blocks/{id}/connect:
 *   post:
 *      security:
 *        - cookieAuth: []
 *      tags:
 *          - Connection
 *      summary: Connect block to channel
 *      description: Connect block to channel
 *      operationId: addConnection
 *      parameters:
 *        - in: path
 *          name: id
 *          schema:
 *           type: string
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
 *              description: Return block
 *              content:
 *                  application/json:
 *                     schema:
 *                       $ref: '#/components/schemas/Block'
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