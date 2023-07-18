// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import GetAllBlocksByUserIdUsecase from '@/services/usecases/block/getAllBlocksByUserId.usecase';
import { TYPES } from '@/utils/types';
import { cache } from '@/resources/caching/cache';

@controller(`/api/v1/users`)
export default class GetAllBlocksByUserIdController {

    private readonly usecase: GetAllBlocksByUserIdUsecase;

    constructor(@inject(TYPES.GET_ALL_BLOCKS_BY_USER_ID_USECASE) getAllBlocksByUserIdUsecase: GetAllBlocksByUserIdUsecase) {
        this.usecase = getAllBlocksByUserIdUsecase;
    }

    @httpGet('/:id/blocks')
    public async getAllBlocksByUserID(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const userID = parseInt(req.params.id);
            const cacheTimespan = '15mins';
            
            const results: any = await cache(`user:${userID}:blocks`, () => this.usecase.execute(userID), cacheTimespan);

            if (Array.isArray(results) && !results.length) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: `User with id [${userID}] has no blocks.` });
            }
            else {
                res.status(200);
                res.send(results);
            }
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }

}