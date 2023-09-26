// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, request, response, next, httpDelete } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import RemoveFriendUsecase from '@/services/usecases/friend/removeFriend.usecase';
import { sessionAuth } from '@/middleware/auth.middleware';
import { TYPES } from '@/utils/types';

@controller(`/users`)
export default class RemoveFriendController {

    private readonly usecase: RemoveFriendUsecase;

    constructor(@inject(TYPES.REMOVE_FRIEND_USECASE) removeFriendUsecase: RemoveFriendUsecase) {
        this.usecase = removeFriendUsecase;
    }

    @httpDelete('/unfollow/user/:id', sessionAuth)
    public async removeFriend(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const unfollowID = parseInt(req.params.id);
            const userID = req.session.user?.id!;

            if (!unfollowID) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: "Missing user to follow." });
            };

            if (!userID) {
                res.status(401);
                return res.send({ error: { status: 401 }, message: `Unauthorized, no log in session.`});
            };
            
            const results = await this.usecase.execute(userID, unfollowID);

            res.status(200);
            res.send({ message: `Unfollowed user with id [${unfollowID}].`});
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }
}

/**
 * @openapi
 *  /users/unfollow/user/{id}:
 *   delete:
 *      security:
 *        - cookieAuth: []
 *      tags:
 *          - Follow
 *      summary: Unfollow user
 *      description: Logged in user unfollows other user
 *      operationId: removeFriend
 *      parameters:
 *        - name: id
 *          in: path
 *          description: ID of user to unfollow
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
 *                                   example: Unfollowed user with id [id].
 *          404:
 *              description: Missing user id to unfollow
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
 *                                   example: Missing user to unfollow.
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