// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify'
// Imports
import GetUserFriendsUsecase from '../../services/usecases/user/getUserFriends.usecase';
import { TYPES } from '../../utils/types';

@controller(`/api/v1/users`)
export default class GetUserFriendsController {

    private readonly usecase: GetUserFriendsUsecase;

    constructor(@inject(TYPES.GET_USER_FRIENDS_USECASE) getUserFriendUsecase: GetUserFriendsUsecase) {
        this.usecase = getUserFriendUsecase;
    }

    @httpGet('/:id/following')
    public async getUserFriends(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const id = parseInt(req.params.id);
            const results = await this.usecase.execute(id);

            if (Array.isArray(results) && !results.length) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: `user with id [${id}] following 0 others.`});
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