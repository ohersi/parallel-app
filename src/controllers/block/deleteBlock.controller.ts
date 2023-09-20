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