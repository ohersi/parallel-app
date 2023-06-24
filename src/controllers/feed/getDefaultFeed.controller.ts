// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import GetDefaultFeedUsecase from '@/services/usecases/feed/getDefaultFeed.usecase';
import { TYPES } from '@/utils/types';
import { cache } from '@/resources/caching/cache';


@controller(`/api/v1/feed`)
export default class GetDefaultFeedController {

    private readonly usecase: GetDefaultFeedUsecase;

    constructor(@inject(TYPES.GET_DEFAULT_FEED_USECASE) getDefaultFeedUsecase: GetDefaultFeedUsecase) {
        this.usecase = getDefaultFeedUsecase;
    }

    @httpGet('/')
    public async getDefaultFeed(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            // const cacheTimespan = '15mins';
            // const results = await cache('channels', this.usecase.execute, cacheTimespan);

            const results = await this.usecase.execute();

            if (Array.isArray(results) && !results.length) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: 'Feed could not be generated.' });
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