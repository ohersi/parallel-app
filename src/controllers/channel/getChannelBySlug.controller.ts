// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import getChannelBySlugUsecase from '../../services/usecases/channel/getChannelBySlug.usecase';
import { TYPES } from '../../utils/types';
import { convertToSlug } from '../../resources/helper/text-manipulation';


@controller(`/api/v1/channels`)
export default class GetChannelBySlugController {

    private readonly usecase: getChannelBySlugUsecase;

    constructor(@inject(TYPES.GET_CHANNEL_BY_SLUG_USECASE) getChannelBySlugUsecase: getChannelBySlugUsecase) {
        this.usecase = getChannelBySlugUsecase;
    }

    @httpGet('/title/:slug')
    public async getChannelBySlug(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const channelSlug = convertToSlug(req.params.slug);
            const results = await this.usecase.execute(channelSlug);
            if (!results) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: `Channel with title ${channelSlug} was not found.` });
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