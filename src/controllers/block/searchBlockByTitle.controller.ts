// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import SearchBlockByTitleUsecase from '@/services/usecases/block/searchBlockByTitle.usecase';
import { TYPES } from '@/utils/types';

@controller(`/blocks`)
export default class SearchBlockByTitleController {

    private readonly usecase: SearchBlockByTitleUsecase;

    constructor(@inject(TYPES.SEARCH_BLOCK_BY_TITLE_USECASE) searchBlockByTitleUsecase: SearchBlockByTitleUsecase) {
        this.usecase = searchBlockByTitleUsecase;
    }

    @httpGet('/search')
    public async searchBlockByTitle(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const title = req.query.title as string;

            if (!title) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: `Missing title to search for.`});
            };

            const results = await this.usecase.execute(title);

            if (Array.isArray(results) && !results.length) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: `No blocks found with that that title: ${title}`});
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
 *  /blocks/search:
 *   get:
 *      tags:
 *          - Block
 *      summary: Search blocks based on query
 *      description: Returns relevant blocks
 *      operationId: searchBlockByTitle
 *      parameters:
 *        - in: query
 *          name: title
 *          schema:
 *            type: string
 *          description: Keyword to search
 *          required: true
 *      responses:
 *          200:
 *              description: Return an array of expanded block objects relevant to search query
 *              content:
 *                  application/json:
 *                     schema:
 *                      type: array
 *                      items:
 *                        allOf:
 *                          - $ref: '#/components/schemas/Block'
 *                          - type: object
 *                            required:
 *                               - channels
 *                            properties:
 *                              channels:
 *                                type: array
 *                                items:
 *                                 anyOf:
 *                                  - $ref: '#/components/schemas/Channel'
 *                                example:
 *                                  - id: 2
 *                                    user:
 *                                       id: 1
 *                                       slug: first-user
 *                                       first_name: First
 *                                       last_name: User 
 *                                       full_name: First User
 *                                    title: Channel 2
 *                                    description: example description
 *                                    slug: channel-2
 *                                    follower_count: 6
 *                                    date_created: 2020-02-01T17:00:00.000Z
 *                                    date_updated: 2020-02-01T17:00:00.000Z
 *          404:
 *              description: Blocks not found with particular keyword
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
 *                                   example: No blocks found with that that title.
 *          500:
 *              description: Server error
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: '#/components/schemas/ServerError'
 */