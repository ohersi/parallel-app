// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpPost, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import AddFriendUsecase from '@/services/usecases/friend/addFriend.usecase';
import { sessionAuth } from '@/middleware/auth.middleware';
import { TYPES } from '@/utils/types';

@controller(`/users`)
export default class AddFriendController {

    private readonly usecase: AddFriendUsecase;

    constructor(@inject(TYPES.ADD_FRIEND_USECASE) addFriendUsecase: AddFriendUsecase) {
        this.usecase = addFriendUsecase;
    }

    @httpPost('/follow/user/:id', sessionAuth)
    public async addFriend(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const followID = parseInt(req.params.id);
            const userID = req.session.user?.id!;

            if (!followID) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: "Missing user to follow." });
            };

            if (!userID) {
                res.status(401);
                return res.send({ error: { status: 401 }, message: `Unauthorized, no log in session.`});
            };
            
            const results = await this.usecase.execute(userID, followID);

            res.status(200);
            res.send({ message: `Following user with id [${followID}].`});
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }
}

/**
 * @openapi
 *  /users/follow/user/{id}:
 *   post:
 *      security:
 *        - cookieAuth: []
 *      tags:
 *          - User
 *      summary: Follow user
 *      description: User must be logged in to preform action
 *      operationId: addFriend
 *      parameters:
 *        - in: path
 *          name: id
 *          schema:
 *            type: string
 *          description: ID of user to follow
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
 *                                   example: Following user with id [id].
 *          404:
 *              description: Missing user id to follow
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
 *                                   example: Missing user to follow.
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