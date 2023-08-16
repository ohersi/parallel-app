// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import GetUserFeedUsecase from '@/services/usecases/feed/getUserFeed.usecase';
import { getFeed } from '@/resources/caching/cache';
import { TYPES } from '@/utils/types';

@controller(`/api/v1/users`)
export default class GetUserFeedController {
    
    private readonly usecase: GetUserFeedUsecase;

    constructor(@inject(TYPES.GET_USER_FEED_USECASE) getUserFeedUsecase: GetUserFeedUsecase) {
        this.usecase = getUserFeedUsecase;
    }
    
    @httpGet('/:id/feed')
    public async getUserFeed(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const id = parseInt(req.params.id);
            
            const cachedFeed = await getFeed(id);
        
            if (Array.isArray(cachedFeed) && !cachedFeed.length) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: `User ${id} has no feed.` });
            }

            const results = await this.usecase.execute(cachedFeed);

            res.status(200);
            res.send(results);
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }

}