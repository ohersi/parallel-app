// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import SearchBlockByTitleUsecase from '../../services/usecases/block/searchBlockByTitle.usecase';
import { TYPES } from '../../utils/types';

@controller(`/api/v1/search`)
export default class SearchBlockByTitleController {

    private readonly usecase: SearchBlockByTitleUsecase;

    constructor(@inject(TYPES.SEARCH_BLOCK_BY_TITLE_USECASE) searchBlockByTitleUsecase: SearchBlockByTitleUsecase) {
        this.usecase = searchBlockByTitleUsecase;
    }

    @httpGet('/block')
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
            }

            const results = await this.usecase.execute(title);

            if (!results) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: `No blocks found with that that [${title}]`});
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