// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpDelete, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import DeleteBlockUsecase from '@/services/usecases/block/deleteBlock.usecase';
import { sessionAuth } from '@/middleware/auth.middleware';
import { TYPES } from '@/utils/types';


@controller(`/blocks`)
export default class DeleteBlockController {

    private readonly usecase: DeleteBlockUsecase;

    constructor(@inject(TYPES.DELETE_BLOCK_USECASE) deleteBlockUsecase: DeleteBlockUsecase) {
        this.usecase = deleteBlockUsecase;
    }

    @httpDelete('/:id', sessionAuth)
    public async deleteBlock(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const blockID = parseInt(req.params.id);
            const userID = req.session.user?.id!;

            if (!userID) {
                res.status(401);
                return res.send({ error: { status: 404 }, message: `Unauthorized, no log in session.`});
            }

            await this.usecase.execute(blockID, userID);

            res.status(200);
            res.send({ message: "Block has been deleted." });
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }
}

/**
 * @openapi
 *  /blocks/{id}/:
 *   delete:
 *      security:
 *        - cookieAuth: []
 *      tags:
 *          - Block
 *      summary: Delete block
 *      description: User must be logged in and have block ownership to preform action
 *      operationId: deleteBlock
 *      parameters:
 *        - in: path
 *          name: id
 *          schema:
 *            type: string
 *          description: ID of block to delete
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
 *                                   example: Block has been deleted.
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