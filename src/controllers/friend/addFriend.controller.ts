// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpPost, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import AddFriendUsecase from '../../services/usecases/friend/addFriend.usecase';
import { sessionAuth } from '../../middleware/auth.middleware';
import { TYPES } from '../../utils/types';

@controller(`/api/v1/users`)
export default class AddFriendController {

    private readonly usecase: AddFriendUsecase;

    constructor(@inject(TYPES.ADD_FRIEND_USECASE) addFriendUsecase: AddFriendUsecase) {
        this.usecase = addFriendUsecase;
    }

    @httpPost('/follow', sessionAuth)
    public async addFriend(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const { user } = req.query;
            if (!user) {
                res.status(500);
                return res.send({ error: { status: 500 }, message: "Missing user to follow." });
            }
            const followID = parseInt(user.toString());
            const userID = req.session.user?.id!;

            const results = await this.usecase.execute(userID, followID);

            res.status(200);
            res.send({ message: `Following user with id [${followID}].`});
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }

}