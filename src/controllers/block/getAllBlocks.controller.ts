// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import GetAllBlocksUsecase from '../../services/usecases/block/getAllBlocks.usecase';
import { roleAuth, sessionAuth } from '../../middleware/auth.middleware';
import { TYPES_ENUM } from '../../utils/types/enum';
import { TYPES } from '../../utils/types';
import { cache } from '../../resources/caching/cache';

@controller(`/api/v1/blocks`)
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
            const results = await cache('blocks', this.usecase.execute);
            res.status(200);
            res.send(results);
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }

}