// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import GetBlockByIdUsecase from '@/services/usecases/block/getBlockByID.usecase';
import { cache } from '@/resources/caching/cache';
import { TYPES } from '@/utils/types';

@controller(`/blocks`)
export default class GetBlockByIdController {

    private readonly usecase: GetBlockByIdUsecase;

    constructor(@inject(TYPES.GET_BLOCK_BY_ID_USECASE) getBlockByIdUsecase: GetBlockByIdUsecase) {
        this.usecase = getBlockByIdUsecase;
    }

    @httpGet('/:id')
    public async getBlockByID(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const id = parseInt(req.params.id);
            const cacheTimespan = '5mins';

            const results = await cache(`block:${id}`, () => this.usecase.execute(id), cacheTimespan);

            if (!results) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: `No blocks found with that id [${id}].` });
            };
            
            res.status(200);
            res.send(results)
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }
}

/**
 * @openapi
 *  /blocks/{id}:
 *   get:
 *      tags:
 *          - Block
 *      summary: Find block By ID
 *      description: Returns a single block
 *      operationId: getBlockByID
 *      parameters:
 *        - in: path
 *          name: id
 *          schema:
 *            type: string
 *          description: ID of block to return
 *          required: true
 *      responses:
 *          200:
 *              description: Return block
 *              content:
 *                  application/json:
 *                     schema:
 *                      allOf:
 *                       - $ref: '#/components/schemas/Block'
 *                       - type: object
 *                         required:
 *                            - channels
 *                         properties:
 *                           channels:
 *                             type: array
 *                             items:
 *                              anyOf:
 *                               - $ref: '#/components/schemas/Channel'
 *                             example:
 *                               - id: 2
 *                                 user:
 *                                    id: 1
 *                                    slug: first-user
 *                                    first_name: First
 *                                    last_name: User 
 *                                    full_name: First User
 *                                 title: Channel 2
 *                                 description: example description
 *                                 slug: channel-2
 *                                 follower_count: 6
 *                                 date_created: 2020-02-01T17:00:00.000Z
 *                                 date_updated: 2020-02-01T17:00:00.000Z
 * 
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
 *                                   example: No blocks found with that id [id].
 *          500:
 *              description: Server error
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: '#/components/schemas/ServerError'
 */