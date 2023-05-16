// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import GetBlockByIdUsecase from '@/services/usecases/block/getBlockByID.usecase';
import { cache } from '@/resources/caching/cache';
import { TYPES } from '@/utils/types';

@controller(`/api/v1/blocks`)
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
            const cacheTimespan = '15mins';

            const results = await cache(`block:${id}`, () => this.usecase.execute(id), cacheTimespan);

            if (!results) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: `No blocks found with that id [${id}]`});
            }
            res.status(200);
            res.send(results)
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }

}