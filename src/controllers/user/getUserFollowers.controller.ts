// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify'
// Imports
import GetUserFollowersUsecase from '../../services/usecases/user/getUserFollowers.usecase';
import { TYPES } from '../../utils/types';

@controller(`/api/v1/users`)
export default class GetUserFollowersController {

    private readonly usecase: GetUserFollowersUsecase;

    constructor(@inject(TYPES.GET_USER_FOLLOWERS_USECASE) getUserFollowersUsecase: GetUserFollowersUsecase) {
        this.usecase = getUserFollowersUsecase;
    }

    @httpGet('/:id/followers')
    public async getUserFollowers(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const id = parseInt(req.params.id);
            const results = await this.usecase.execute(id);
            
            if (Array.isArray(results) && !results.length) {
                res.status(500);
                return res.send({ error: { status: 500 }, message: `user with id [${id}] has no followers.` });
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