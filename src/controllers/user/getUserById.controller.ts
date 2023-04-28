// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify'
// Imports
import GetUserByIdUseCase from '../../services/usecases/user/getUserById.usecase';
import { TYPES } from '../../utils/types';

@controller(`/api/v1/users`)
export default class GetUserByIdController {

    private readonly usecase: GetUserByIdUseCase;

    constructor(@inject(TYPES.GET_USER_BY_ID_USECASE) getUserByIdUseCase: GetUserByIdUseCase) {
        this.usecase = getUserByIdUseCase;
    }

    @httpGet('/:id')
    public async getUserByID(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const id = parseInt(req.params.id);
            const results = await this.usecase.execute(id);
            if (!results) {
                res.status(404);
                res.send({ error: { status: 404 }, message: 'No users found with that id' });
            }
            else {
                res.status(200);
                res.send(results)
            }
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }

}