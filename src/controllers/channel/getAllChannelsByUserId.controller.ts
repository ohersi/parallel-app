// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import GetAllChannelsByUserIdUsecase from '../../services/usecases/channel/getAllChannelsByUserId.usecase';
import { TYPES } from '../../utils/types';
import { TYPES_ENUM } from '../../utils/types/enum';
import { sessionAuth, roleAuth } from '../../middleware/auth.middleware';
import { cache } from '../../resources/caching/cache';


@controller(`/api/v1/users`)
export default class GetAllChannelsByUserIdController {

    private readonly usecase: GetAllChannelsByUserIdUsecase;

    constructor(@inject(TYPES.GET_ALL_CHANNELS_BY_USER_ID_USECASE) getAllChannelsByUserID: GetAllChannelsByUserIdUsecase) {
        this.usecase = getAllChannelsByUserID;
    }

    @httpGet('/:id/channels')
    public async getAllChannelsByUserID(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const userID = parseInt(req.params.id)
            const results = await this.usecase.execute(userID);
            // const results = await cache('users', this.usecase.execute);

            if (Array.isArray(results) && !results.length) {
                res.status(404);
                res.send({ error: { status: 404 }, message: 'No channels found with that id' });
            }
            else {
                res.status(200);
                res.send(results);
            }
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }

}