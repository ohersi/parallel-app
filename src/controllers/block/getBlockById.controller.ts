// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import GetBlockByIdUsecase from '../../services/usecases/block/getBlockByID.usecase';
import { TYPES } from '../../utils/types';

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
            const id  = parseInt(req.params.id)
            const results = await this.usecase.execute(id);
            
            if (Array.isArray(results) && !results.length) {
                res.status(500);
                res.send({ error: { status: 500 }, message: 'No block found with that id' });
            }
            else {
                res.status(200);
                res.send(results)
            }
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }

}