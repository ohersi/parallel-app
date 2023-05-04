// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, request, response, next, httpDelete } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import UnFollowChannelUsecase from '../../services/usecases/follow/unfollowChannel.usecase';
import { sessionAuth } from '../../middleware/auth.middleware';
import { TYPES } from '../../utils/types';

@controller(`/api/v1/users`)
export default class UnFollowChannelController {

    private readonly usecase: UnFollowChannelUsecase;

    constructor(@inject(TYPES.UNFOLLOW_CHANNEL_USECASE) unfollowChannelUsecase: UnFollowChannelUsecase) {
        this.usecase = unfollowChannelUsecase;
    }

    @httpDelete('/unfollow/channel/:id', sessionAuth)
    public async unfollowChannel(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const unfollowID = parseInt(req.params.id);

            if (!unfollowID) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: "Missing channel to unfollow." });
            }
            
            const userID = req.session.user?.id!;
            const results = await this.usecase.execute(userID, unfollowID);

            res.status(200);
            res.send({ message: `Channel with id [${unfollowID}] has been unfollowed.` });
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }

}