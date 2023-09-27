// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import SearchUserByNameUsecase from '@/services/usecases/user/searchUserByName.usecase';
import { TYPES } from '@/utils/types';

@controller(`/users`)
export default class SearchUserByNameController {

    private readonly usecase: SearchUserByNameUsecase;

    constructor(@inject(TYPES.SEARCH_USER_BY_NAME_USECASE) searchUserByNameUsecase: SearchUserByNameUsecase) {
        this.usecase = searchUserByNameUsecase;
    }

    @httpGet('/search')
    public async searchUserByName(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const name = req.query.name as string;
            if (!name) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: `Missing name to search for.` });
            }

            const results = await this.usecase.execute(name);

            if (Array.isArray(results) && !results.length) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: `No users found with that that name: ${name}` });
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
 *  /users/search:
 *   get:
 *      tags:
 *          - User
 *      summary: Search users based on query
 *      description: Returns relevant users
 *      operationId: searchUserByName
 *      parameters:
 *        - in: query
 *          name: name
 *          schema:
 *            type: string
 *          description: Keyword to search
 *          required: true
 *      responses:
 *          200:
 *              description: Return an array of user objects relevant to search query
 *              content:
 *                  application/json:
 *                     schema:
 *                      type: array
 *                      items:
 *                         $ref: '#/components/schemas/User'
 *                      example:
 *                         - id: 2
 *                           slug: second-user
 *                           first_name: second
 *                           last_name: last
 *                           full_name: Second User
 *                           email: second@email.com
 *                           avatar: image.jpg
 *                           following_count: 3
 *                           follower_count: 4
 *                           role: user
 *                           enabled: true
 *                           locked: false
 *                         - id: 5
 *                           slug: firth-user
 *                           first_name: fifth
 *                           last_name: last
 *                           full_name: Fifth User
 *                           email: fifth@email.com
 *                           avatar: image.jpg
 *                           following_count: 0
 *                           follower_count: 1
 *                           role: user
 *                           enabled: true
 *                           locked: false
 *          404:
 *              description: User not found with particular keyword
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
 *                                   example: No users found with that that title.
 *          500:
 *              description: Server error
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: '#/components/schemas/ServerError'
 */