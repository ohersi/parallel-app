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


@controller(`/api/v1/channels`)
export default class CreateBlockController {

    private readonly usecase: CreateBlockUsecase;

    constructor(@inject(TYPES.CREATE_BLOCK_USECASE) createBlockUsecase: CreateBlockUsecase) {
        this.usecase = createBlockUsecase;
    }

    @httpPost('/:id/add', sessionAuth, validationMiddleware(blockValidation.create), moderate)
    public async createBlock(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const channelID = parseInt(req.params.id);
            const userID = req.session.user?.id!;
            
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