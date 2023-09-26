// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify'
// Imports
import GetUserBySlugUseCase from '@/services/usecases/user/getUserBySlug.usecase';
import { convertToSlug } from '@/resources/helper/text-manipulation';
import { cache } from '@/resources/caching/cache';
import { TYPES } from '@/utils/types';

@controller(`/users`)
export default class GetUserBySlugController {

    private readonly usecase: GetUserBySlugUseCase;

    constructor(@inject(TYPES.GET_USER_BY_SLUG_USECASE) getUserBySlugUseCase: GetUserBySlugUseCase) {
        this.usecase = getUserBySlugUseCase;
    }

    @httpGet('/name/:slug')
    public async getUserBySlug(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const slug = convertToSlug(req.params.slug);
            const cacheTimespan = '5mins';

            const results: any = await cache(`user:${slug}`, () => this.usecase.execute(slug), cacheTimespan);

            if (!results) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: `User with name [${slug}] was not found.`});
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
 *  /users/name/{slug}:
 *   get:
 *      tags:
 *          - User
 *      summary: Find user by slug
 *      description: Returns a single user
 *      operationId: getUserBySlug
 *      parameters:
 *        - in: path
 *          name: slug
 *          schema:
 *            type: string
 *          description: slug of user to return
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
 *                         last_name: last
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
 *                                   example: User with name [slug] was not found.
 *          500:
 *              description: Server error
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: '#/components/schemas/ServerError'
 */