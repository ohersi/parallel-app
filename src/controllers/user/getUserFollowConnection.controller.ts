// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify'
// Imports
import GetUserFollowConnectionUsecase from '@/services/usecases/user/getUserFollowConnection.usecase';
import { TYPES } from '@/utils/types';

@controller(`/channels`)
export default class GetUserFollowConnectionController {

    private readonly usecase: GetUserFollowConnectionUsecase;

    constructor(@inject(TYPES.GET_USER_FOLLOW_CONNECTION_USECASE) getUserFollowConnectionUsecase: GetUserFollowConnectionUsecase) {
        this.usecase = getUserFollowConnectionUsecase;
    }

    @httpGet('/connection/:id')
    public async getUserFollowConnection(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const userID = req.session.user?.id;
            const channelID = parseInt(req.params.id);

            const results = await this.usecase.execute(userID!, channelID);

            if (!results) {
                res.status(404);
                return res.send({ status: results });
            };

            res.status(200);
            res.send({ status: results });
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }

}