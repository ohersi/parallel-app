// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import GetDefaultFeedUsecase from '@/services/usecases/feed/getDefaultFeed.usecase';
import { cache } from '@/resources/caching/cache';
import { TYPES } from '@/utils/types';
import { decodeLastID } from '@/resources/helper/text-manipulation';
import { paginate } from '@/middleware/paginate.middlware';


@controller(`/api/v1/feed`)
export default class GetDefaultFeedController {

    private readonly usecase: GetDefaultFeedUsecase;

    constructor(@inject(TYPES.GET_DEFAULT_FEED_USECASE) getDefaultFeedUsecase: GetDefaultFeedUsecase) {
        this.usecase = getDefaultFeedUsecase;
    }

    @httpGet('/', paginate)
    public async getDefaultFeed(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {

            const channel_lastID = decodeLastID(req.query.channel_lastID as string);
            const block_lastID = decodeLastID(req.query.block_lastID as string);
            const limit = parseInt(req.query.limit as string);

            const results = await this.usecase.execute(channel_lastID, block_lastID, limit);

            if (!results) {
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