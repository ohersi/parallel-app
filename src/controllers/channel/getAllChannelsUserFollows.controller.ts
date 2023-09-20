// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import GetAllChannelsUserFollowsUsecase from '@/services/usecases/channel/getAllChannelsUserFollows.usecase';
import { cache } from '@/resources/caching/cache';
import { TYPES } from '@/utils/types';

@controller(`/users`)
export default class GetAllChannelsUserFollowsController {

    private readonly usecase: GetAllChannelsUserFollowsUsecase;

    constructor(@inject(TYPES.GET_ALL_CHANNELS_USER_FOLLOWS_USECASE) getAllChannelsUserFollowsUsecase: GetAllChannelsUserFollowsUsecase) {
        this.usecase = getAllChannelsUserFollowsUsecase;
    }

    @httpGet('/:slug/following')
    public async getAllChannelsUserFollows(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const slug = req.params.slug;
            const cacheTimespan = '60s';
            
            const results: any = await cache(`user:${slug}:channels:following`, () => this.usecase.execute(slug), cacheTimespan);

            if (Array.isArray(results) && !results.length) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: `User not following any channels.` });
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