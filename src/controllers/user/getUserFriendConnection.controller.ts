// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify'
// Imports
import GetUserFriendConnectionUsecase from '@/services/usecases/user/getUserFriendConnection.usecase';
import { TYPES } from '@/utils/types';

@controller(`/users`)
export default class GetUserFriendConnectionController {

    private readonly usecase: GetUserFriendConnectionUsecase;

    constructor(@inject(TYPES.GET_USER_FRIEND_CONNECTION_USECASE) getUserFriendConnectionUsecase: GetUserFriendConnectionUsecase) {
        this.usecase = getUserFriendConnectionUsecase;
    }

    @httpGet('/connection/:id')
    public async getUserFriendConnection(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const userID = req.session.user?.id;
            const id = parseInt(req.params.id);

            const results = await this.usecase.execute(userID!, id);

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