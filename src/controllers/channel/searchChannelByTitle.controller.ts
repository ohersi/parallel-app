// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import SearchChannelByTitleUsecase from '@/services/usecases/channel/searchChannelByTitle.usecase';
import { TYPES } from '@/utils/types';
import { cache } from '@/resources/caching/cache';


@controller(`/api/v1/search`)
export default class SearchChannelByTitleController {

    private readonly usecase: SearchChannelByTitleUsecase;

    constructor(@inject(TYPES.SEARCH_CHANNEL_BY_TITLE_USECASE) searchChannelByTitleUsecase: SearchChannelByTitleUsecase) {
        this.usecase = searchChannelByTitleUsecase;
    }

    @httpGet('/channels')
    public async searchChannelByTitle(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const title = req.query.title as string;
            if (!title) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: `Missing title to search for.` });
            }

            const results = await this.usecase.execute(title);

            if (Array.isArray(results) && !results.length) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: `No channels found with that that title: ${title}` });
            }
            res.status(200);
            res.send(results);
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }
}