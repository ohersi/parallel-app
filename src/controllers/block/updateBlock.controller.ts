// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpPut, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import BlockDTO from '@/dto/block.dto';
import UpdateBlockUsecase from '@/services/usecases/block/updateBlock.usecase';
import validationMiddleware from '@/middleware/validation.middleware';
import blockValidation from '@/resources/validations/block.validation';
import { moderate } from '@/middleware/moderation.middleware';
import { sessionAuth } from '@/middleware/auth.middleware';
import { update } from '@/resources/caching/cache';
import { TYPES } from '@/utils/types';


@controller(`/api/v1/blocks`)
export default class UpdateBlockController {

    private readonly usecase: UpdateBlockUsecase;

    constructor(@inject(TYPES.UPDATE_BLOCK_USECASE) updateBlockUsecase: UpdateBlockUsecase) {
        this.usecase = updateBlockUsecase;
    }

    @httpPut('/:id/update', validationMiddleware(blockValidation.update), sessionAuth, moderate)
    public async updateBlock(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const blockID = parseInt(req.params.id);
            const userID = req.session.user?.id!;
            const block = req.body as BlockDTO;
            const cacheTimespan = '15mins';

            const results = await this.usecase.execute(blockID, userID, block);

            // Update block cache
            await update('block', results.id, results, cacheTimespan);

            res.status(200);
            res.send("Block has been updated.");
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }
}