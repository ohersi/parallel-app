// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import GetAllUsersUseCase from '../../services/usecases/user/getAllUsers.usecase';
import { sessionAuth, roleAuth } from '../../middleware/auth.middleware';
import { paginate } from '../../middleware/paginate.middlware';
import { TYPES_ENUM } from '../../utils/types/enum';
import { TYPES } from '../../utils/types';

@controller(`/api/v1/users`)
export default class GetAllUsersController {

    private readonly usecase: GetAllUsersUseCase;

    constructor(@inject(TYPES.GET_ALL_USERS_USECASE) getAllUsersUseCase: GetAllUsersUseCase) {
        this.usecase = getAllUsersUseCase;
    }

    @httpGet('/', sessionAuth, roleAuth(TYPES_ENUM.ADMIN), paginate)
    public async getAllUsers(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const last_id = parseInt(req.query.last_id as string) || 0;
            const limit = parseInt(req.query.limit as string);

            const results  = await this.usecase.execute(last_id, limit);

            if (Array.isArray(results.data) && !results.data.length) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: 'No users found.' });
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