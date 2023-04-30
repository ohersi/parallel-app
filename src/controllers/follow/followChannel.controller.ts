// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpPost, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import FollowChannelUsecase from '../../services/usecases/follow/followChannel.usecase';
import { sessionAuth } from '../../middleware/auth.middleware';
import { TYPES } from '../../utils/types';

@controller(`/api/v1/users`)
export default class FollowChannelController {

    private readonly usecase: FollowChannelUsecase;

    constructor(@inject(TYPES.FOLLOW_CHANNEL_USECASE) followChannelUsecase: FollowChannelUsecase) {
        this.usecase = followChannelUsecase;
    }

    @httpPost('/follow/', sessionAuth)
    public async followChannel(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const { channel } = req.query;
            if (!channel) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: "Missing channel to follow." });
            }
            const followID = parseInt(channel.toString());
            const userID = req.session.user?.id!;

            const results = await this.usecase.execute(userID, followID);
            res.status(200);
            res.send({ message: `Following channel with id [${followID}].` });
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }

}