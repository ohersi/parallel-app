// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify'
// Imports
import GetUserFollowConnectionUsecase from '@/services/usecases/user/getUserFollowConnection.usecase';
import { TYPES } from '@/utils/types';

@controller(`/channels`)
export default class GetUserFollowConnectionController {

    private readonly usecase: GetUserFollowConnectionUsecase;

    constructor(@inject(TYPES.GET_USER_FOLLOW_CONNECTION_USECASE) getUserFollowConnectionUsecase: GetUserFollowConnectionUsecase) {
        this.usecase = getUserFollowConnectionUsecase;
    }

    @httpGet('/connection/:id')
    public async getUserFollowConnection(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const userID = req.session.user?.id;
            const channelID = parseInt(req.params.id);

            if (!userID) {
                res.status(401);
                return res.send({ error: { status: 401 }, message: `Unauthorized, no log in session.`});
            };

            const results = await this.usecase.execute(userID!, channelID);

            if (!results) {
                res.status(404);
                return res.send({ status: results });
            };

            res.status(200);
            res.send({ status: results });
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }
}

/**
 * @openapi
 *  /channels/connection/{id}:
 *   get:
 *      security:
 *        - cookieAuth: []
 *      tags:
 *          - Follow
 *      summary: Check if user follows channel 
 *      description: Checks whether user follows channel
 *      operationId: getUserFollowConnection
 *      parameters:
 *        - name: id
 *          in: path
 *          description: ID of channel to check connection
 *          required: true
 *      responses:
 *          200:
 *              description: Return status object with boolean of true
 *              content:
 *                  application/json:
 *                     schema:
 *                       properties:
 *                          status:
 *                             type: boolean
 *                             example: true
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
 *          404:
 *              description: No connection, return status object with boolean of false
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              status:
 *                                 type: boolean
 *                                 example: false
 *          500:
 *              description: Server error
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: '#/components/schemas/ServerError'
 */