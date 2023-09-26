// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify'
// Imports
import GetUserByIdUseCase from '@/services/usecases/user/getUserById.usecase';
import { cache } from '@/resources/caching/cache';
import { TYPES } from '@/utils/types';

@controller(`/users`)
export default class GetUserByIdController {

    private readonly usecase: GetUserByIdUseCase;

    constructor(@inject(TYPES.GET_USER_BY_ID_USECASE) getUserByIdUseCase: GetUserByIdUseCase) {
        this.usecase = getUserByIdUseCase;
    }

    @httpGet('/:id')
    public async getUserByID(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const id = parseInt(req.params.id);
            const cacheTimespan = '15mins';

            const results: any = await cache(`user:${id}`, () => this.usecase.execute(id), cacheTimespan);

            if (!results) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: `No user found with that id: ${id}`});
            };

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
 *  /users/{id}:
 *   get:
 *      tags:
 *          - User
 *      summary: Find user By ID
 *      description: Returns a single user
 *      operationId: getUserByID
 *      parameters:
 *        - in: path
 *          name: id
 *          schema:
 *            type: string
 *          description: ID of user to return
 *          required: true
 *      responses:
 *          200:
 *              description: Return user
 *              content:
 *                  application/json:
 *                     schema:
 *                       $ref: '#/components/schemas/User'
 *                     example:
 *                         id: 1
 *                         slug: first-user
 *                         first_name: first
 *                         last_name: user
 *                         full_name: First User
 *                         email: first@email.com
 *                         avatar: image.jpg
 *                         following_count: 5
 *                         follower_count: 1
 *                         role: user
 *                         enabled: true
 *                         locked: false
 *          404:
 *              description: User not found
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
 *                                   example: No users found with that id [id].
 *          500:
 *              description: Server error
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: '#/components/schemas/ServerError'
 */