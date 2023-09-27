// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpPost, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import CreateBlockUsecase from '@/services/usecases/block/createBlock.usecase';
import validationMiddleware from '@/middleware/validation.middleware';
import blockValidation from '@/resources/validations/block.validation';
import { moderate } from '@/middleware/moderation.middleware';
import { sessionAuth } from '@/middleware/auth.middleware';
import { TYPES } from '@/utils/types';


@controller(`/blocks`)
export default class CreateBlockController {

    private readonly usecase: CreateBlockUsecase;

    constructor(@inject(TYPES.CREATE_BLOCK_USECASE) createBlockUsecase: CreateBlockUsecase) {
        this.usecase = createBlockUsecase;
    }

    @httpPost('/channel/:id/add', sessionAuth, validationMiddleware(blockValidation.create), moderate)
    public async createBlock(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const channelID = parseInt(req.params.id);
            const userID = req.session.user?.id!;

            if (!userID) {
                res.status(401);
                return res.send({ error: { status: 404 }, message: `Unauthorized, no log in session.`});
            }

            const results = await this.usecase.execute(req.body, userID, channelID);

            res.status(201);
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
 *  /blocks/channel/{id}/add:
 *   post:
 *      security:
 *        - cookieAuth: []
 *      tags:
 *          - Block
 *      summary: Create block
 *      description: User must be logged in and have channel ownership to preform action
 *      operationId: createBlock
 *      parameters:
 *        - in: path
 *          name: id
 *          schema:
 *            type: string
 *          description: ID of channel to create block in
 *          required: true
 *      responses:
 *          200:
 *              description: Return newly created block
 *              content:
 *                  application/json:
 *                     schema:
 *                       $ref: '#/components/schemas/Block'
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