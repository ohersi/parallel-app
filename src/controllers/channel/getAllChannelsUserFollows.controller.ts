// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import GetAllChannelsUserFollowsUsecase from '../../services/usecases/channel/getAllChannelsUserFollows.usecase';
import { cache } from '../../resources/caching/cache';
import { TYPES } from '../../utils/types';

@controller(`/api/v1/users`)
export default class GetAllChannelsUserFollowsController {

    private readonly usecase: GetAllChannelsUserFollowsUsecase;

    constructor(@inject(TYPES.GET_ALL_CHANNELS_USER_FOLLOWS_USECASE) getAllChannelsUserFollowsUsecase: GetAllChannelsUserFollowsUsecase) {
        this.usecase = getAllChannelsUserFollowsUsecase;
    }

    @httpGet('/:id/following')
    public async getAllChannelsUserFollows(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const id = parseInt(req.params.id);
            
            const results: any = await cache(`user:${id}:channels:following`, () => this.usecase.execute(id));

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