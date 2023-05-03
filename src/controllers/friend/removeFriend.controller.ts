// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, request, response, next, httpDelete } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import RemoveFriendUsecase from '../../services/usecases/friend/removeFriend.usecase';
import { sessionAuth } from '../../middleware/auth.middleware';
import { TYPES } from '../../utils/types';

@controller(`/api/v1/users`)
export default class RemoveFriendController {

    private readonly usecase: RemoveFriendUsecase;

    constructor(@inject(TYPES.REMOVE_FRIEND_USECASE) removeFriendUsecase: RemoveFriendUsecase) {
        this.usecase = removeFriendUsecase;
    }

    @httpDelete('/unfollow', sessionAuth)
    public async removeFriend(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const { user } = req.query;
            if (!user) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: "Missing user to follow." });
            }
            const followID = parseInt(user.toString());
            const userID = req.session.user?.id!;

            const results = await this.usecase.execute(userID, followID);

            res.status(200);
            res.send({ message: `Unfollowed user with id [${followID}].`});
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }

}