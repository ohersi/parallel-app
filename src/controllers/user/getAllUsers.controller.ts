// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import GetAllUsersUseCase from '../../services/usecases/user/getAllUsers.usecase';
import { TYPES } from '../../utils/types';
import { TYPES_ENUM } from '../../utils/types/enum';
import { sessionAuth, roleAuth } from '../../middleware/auth.middleware';
import { cache } from '../../middleware/cache.middleware';


@controller(`/api/v1/users`)
export default class GetAllUsersController {

    private readonly usecase: GetAllUsersUseCase;

    constructor(@inject(TYPES.GET_ALL_USERS_USECASE) getAllUsersUseCase: GetAllUsersUseCase) {
        this.usecase = getAllUsersUseCase;
    }

    @httpGet('/', sessionAuth, roleAuth(TYPES_ENUM.ADMIN))
    public async getAllUsers(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const results = await cache('users', this.usecase.execute);
            res.status(200);
            res.send(results);
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }

}