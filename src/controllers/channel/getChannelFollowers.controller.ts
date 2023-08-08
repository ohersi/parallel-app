// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import GetChannelFollowersUsecase from '@/services/usecases/channel/getChannelFollowers.usecase';
import { cache } from '@/resources/caching/cache';
import { TYPES } from '@/utils/types';


@controller(`/api/v1/channels`)
export default class GetChannelFollowersController {

    private readonly usecase: GetChannelFollowersUsecase;

    constructor(@inject(TYPES.GET_CHANNEL_FOLLOWERS_USECASE) getChannelFollowersUsecase: GetChannelFollowersUsecase) {
        this.usecase = getChannelFollowersUsecase;
    }

    @httpGet('/:slug/followers')
    public async getChannelFollowers(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const slug = req.params.slug;
            const cacheTimespan = '15mins';
            
            const results: any = await cache(`channel:${slug}:users:followers`, () => this.usecase.execute(slug), cacheTimespan);
            
            if (Array.isArray(results) && !results.length) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: `Channel has no followers.` });
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