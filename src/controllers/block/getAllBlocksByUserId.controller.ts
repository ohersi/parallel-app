// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import GetAllBlocksByUserIdUsecase from '@/services/usecases/block/getAllBlocksByUserId.usecase';
import { TYPES } from '@/utils/types';
import { cache } from '@/resources/caching/cache';

@controller(`/blocks`)
export default class GetAllBlocksByUserIdController {

    private readonly usecase: GetAllBlocksByUserIdUsecase;

    constructor(@inject(TYPES.GET_ALL_BLOCKS_BY_USER_ID_USECASE) getAllBlocksByUserIdUsecase: GetAllBlocksByUserIdUsecase) {
        this.usecase = getAllBlocksByUserIdUsecase;
    }

    @httpGet('/user/:id')
    public async getAllBlocksByUserID(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const userID = parseInt(req.params.id);
            const cacheTimespan = '15mins';
            
            const results: any = await cache(`user:${userID}:blocks`, () => this.usecase.execute(userID), cacheTimespan);

            if (Array.isArray(results) && !results.length) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: `User with id [${userID}] has no blocks.` });
            }
            else {
                res.status(200);
                res.send(results);
            };
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }
}

/**
 * @openapi
 *  /blocks/user/{id}:
 *   get:
 *      tags:
 *          - Block
 *      summary: Find all blocks by user ID
 *      description: Returns all user blocks
 *      operationId: getAllBlocksByUserID
 *      parameters:
 *        - in: path
 *          name: id
 *          schema:
 *            type: string
 *          description: ID of user to search
 *          required: true
 *      responses:
 *          200:
 *              description: Return all user blocks
 *              content:
 *                  application/json:
 *                     schema:
 *                      type: array
 *                      items:
 *                        $ref: '#/components/schemas/Block'
 *                      example:
 *                        - id: 1
 *                          unique_id: abc123
 *                          user: 2
 *                          title: Block 1
 *                          description: example description
 *                          source_url: source.com
 *                          image_url: image.jpg
 *                          date_created: 2020-01-01T17:00:00.000Z
 *                          date_updated: 2020-01-01T17:00:00.000Z
 *                        - id: 2
 *                          unique_id: abc567
 *                          user: 2
 *                          title: Block 2
 *                          description: example description
 *                          source_url: source.com
 *                          image_url: image.jpg
 *                          date_created: 2021-05-15T17:00:00.000Z
 *                          date_updated: 2021-05-15T17:00:00.000Z
 *          404:
 *              description: Blocks not found from particular user
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
 *                                   example: User with id [id] has no blocks.
 *          500:
 *              description: Server error
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: '#/components/schemas/ServerError'
 */
