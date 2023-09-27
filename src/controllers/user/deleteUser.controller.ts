// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpDelete, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify'
// Imports
import DeleteUserUsecase from '@/services/usecases/user/deleteUser.usecase';
import { sessionAuth } from '@/middleware/auth.middleware';
import { TYPES } from '@/utils/types';

@controller(`/users`)
export default class DeleteUserController {

    private readonly usecase: DeleteUserUsecase;

    constructor(@inject(TYPES.DELETE_USER_USECASE) deleteUserUsecase: DeleteUserUsecase) {
        this.usecase = deleteUserUsecase;
    }

    @httpDelete('/:id', sessionAuth)
    public async deleteUser(
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
            };

            const results = await this.usecase.execute(id, userID);

            res.status(200);
            res.send({ message: "User has been deleted."});
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }
}

/**
 * @openapi
 *  /users/{id}:
 *   delete:
 *      security:
 *        - cookieAuth: []
 *      tags:
 *          - User
 *      summary: Delete user
 *      description: User must be logged in to preform action
 *      operationId: deleteUser
 *      parameters:
 *        - in: path
 *          name: id
 *          schema:
 *            type: string
 *          description: ID of user to delete
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
 *                                   example: User has been deleted.
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