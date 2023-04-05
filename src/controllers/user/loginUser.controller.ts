// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, request, response, next, httpPost } from 'inversify-express-utils'
import { inject } from 'inversify'
// Imports
import LoginUserUseCase from '../../services/usecases/user/loginUser.usecase';
import { TYPES } from '../../utils/types';

@controller(`/api/v1/users`)
export default class LoginUserController {

    private readonly usecase: LoginUserUseCase;

    constructor(@inject(TYPES.LOGIN_USER) loginUserUseCase: LoginUserUseCase) {
        this.usecase = loginUserUseCase;
    }

    @httpPost('/login')
    public async loginUser (
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            // TODO: req must contain keys email & password only, convert to DTO?
            const results = await this.usecase.execute(req.body);
            if (!results) {
                res.status(500);
                res.send({ error: { status: 500 }, message: 'password or email does not match' });
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