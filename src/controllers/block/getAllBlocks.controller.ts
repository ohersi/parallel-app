// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import GetAllBlocksUsecase from '@/services/usecases/block/getAllBlocks.usecase';
import { roleAuth, sessionAuth } from '@/middleware/auth.middleware';
import { TYPES_ENUM } from '@/utils/types/enum';
import { TYPES } from '@/utils/types';
import { cache } from '@/resources/caching/cache';

@controller(`/blocks`)
export default class GetAllBlocksController {

    private readonly usecase: GetAllBlocksUsecase;

    constructor(@inject(TYPES.GET_ALL_BLOCKS_USECASE) getAllBlocksUsecase: GetAllBlocksUsecase) {
        this.usecase = getAllBlocksUsecase;
    }

    @httpGet('/', sessionAuth, roleAuth(TYPES_ENUM.ADMIN))
    public async getAllBlocks(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const cacheTimespan = '15mins';
            const results = await cache('blocks', this.usecase.execute, cacheTimespan);

            if (Array.isArray(results) && !results.length) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: 'No blocks found.' });
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
 *  /blocks:
 *   get:
 *      security:
 *          - cookieAuth: []
 *      tags:
 *          - Block
 *      summary: Get all blocks
 *      description: Returns all blocks
 *      operationId: getAllBlock
 *      responses:
 *          200:
 *              description: Return all blocks
 *              content:
 *                  application/json:
 *                     schema:
 *                      type: array
 *                      items:
 *                        $ref: '#/components/schemas/Block'
 *                      example:
 *                        - id: 5
 *                          unique_id: abc123
 *                          user: 4
 *                          title: Block 5
 *                          description: example description
 *                          source_url: source.com
 *                          image_url: image.jpg
 *                          date_created: 2020-01-01T17:00:00.000Z
 *                          date_updated: 2020-01-01T17:00:00.000Z
 *                        - id: 8
 *                          unique_id: abc567
 *                          user: 6
 *                          title: Block 8
 *                          description: example description
 *                          source_url: source.com
 *                          image_url: image.jpg
 *                          date_created: 2021-05-15T17:00:00.000Z
 *                          date_updated: 2021-05-15T17:00:00.000Z
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
 *              description: Block not found
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
 *                                   example: No blocks found.
 *          500:
 *              description: Server error
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: '#/components/schemas/ServerError'
 */