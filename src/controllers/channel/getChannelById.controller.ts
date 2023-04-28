// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import GetChannelByIdUsecase from '../../services/usecases/channel/getChannelById.usecase';
import { TYPES } from '../../utils/types';
import { TYPES_ENUM } from '../../utils/types/enum';
import { sessionAuth, roleAuth } from '../../middleware/auth.middleware';
import { cache } from '../../resources/caching/cache';


@controller(`/api/v1/channels`)
export default class GetChannelByIdController {

    private readonly usecase: GetChannelByIdUsecase;

    constructor(@inject(TYPES.GET_CHANNEL_BY_ID_USECASE) getChannelByIdUsecase: GetChannelByIdUsecase) {
        this.usecase = getChannelByIdUsecase;
    }

    @httpGet('/:id')
    public async getChannelByID(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const channelID = parseInt(req.params.id);
            const results = await this.usecase.execute(channelID);
            if (!results) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: 'No channels found with that id.' });
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