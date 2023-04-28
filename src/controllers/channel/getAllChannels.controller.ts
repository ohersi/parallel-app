// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import GetAllChannelsUsecase from '../../services/usecases/channel/getAllChannels.usecase';
import { TYPES } from '../../utils/types';
import { cache } from '../../resources/caching/cache';


@controller(`/api/v1/channels`)
export default class GetAllChannelsController {

    private readonly usecase: GetAllChannelsUsecase;

    constructor(@inject(TYPES.GET_ALL_CHANNELS_USECASE) getAllChannelsUsecase: GetAllChannelsUsecase) {
        this.usecase = getAllChannelsUsecase;
    }

    @httpGet('/')
    public async getAllChannels(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const results = await cache('channels', this.usecase.execute);
            if (Array.isArray(results) && !results.length) {
                res.status(404);
                res.send({ error: { status: 404 }, message: 'No channels found.' });
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