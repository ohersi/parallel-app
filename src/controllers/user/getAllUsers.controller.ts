// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import GetAllUsersUseCase from '@/services/usecases/user/getAllUsers.usecase';
import { sessionAuth, roleAuth } from '@/middleware/auth.middleware';
import { paginate } from '@/middleware/paginate.middlware';
import { TYPES_ENUM } from '@/utils/types/enum';
import { TYPES } from '@/utils/types';

@controller(`/users`)
export default class GetAllUsersController {

    private readonly usecase: GetAllUsersUseCase;

    constructor(@inject(TYPES.GET_ALL_USERS_USECASE) getAllUsersUseCase: GetAllUsersUseCase) {
        this.usecase = getAllUsersUseCase;
    }

    @httpGet('/', sessionAuth, roleAuth(TYPES_ENUM.ADMIN), paginate)
    public async getAllUsers(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const last_id = parseInt(req.query.last_id as string) || 0;
            const limit = parseInt(req.query.limit as string);

            const results  = await this.usecase.execute(last_id, limit);

            if (Array.isArray(results.data) && !results.data.length) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: 'No users found.' });
            }
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
 *  /users:
 *   get:
 *      security:
 *        - cookieAuth: []
 *      tags:
 *          - User
 *      summary: Get all users
 *      description: Returns all users
 *      operationId: getAllUsers
 *      responses:
 *          200:
 *              description: Return all users
 *              content:
 *                  application/json:
 *                     schema:
 *                      type: array
 *                      items:
 *                        $ref: '#/components/schemas/User'
 *                      example:
 *                        - id: 2
 *                          slug: second-user
 *                          first_name: second
 *                          last_name: last
 *                          full_name: Second User
 *                          email: second@email.com
 *                          avatar: image.jpg
 *                          following_count: 3
 *                          follower_count: 4
 *                          role: user
 *                          enabled: true
 *                          locked: false
 *                        - id: 5
 *                          slug: firth-user
 *                          first_name: fifth
 *                          last_name: last
 *                          full_name: Fifth User
 *                          email: fifth@email.com
 *                          avatar: image.jpg
 *                          following_count: 0
 *                          follower_count: 1
 *                          role: user
 *                          enabled: true
 *                          locked: false
 *          404:
 *              description: No users found
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
 *                                   example: No users found.
 *          500:
 *              description: Server error
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: '#/components/schemas/ServerError'
 */