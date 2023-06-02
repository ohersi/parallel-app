// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, request, response, next, httpPost } from 'inversify-express-utils';
import { inject } from 'inversify';
// Imports
import LoginUserUseCase from '@/services/usecases/user/loginUser.usecase';
import validationMiddleware from '@/middleware/validation.middleware';
import userValidation from '@/resources/validations/user.validation';
import { TYPES } from '@/utils/types';

@controller(`/api/v1/users`)
export default class LoginUserController {

    private readonly usecase: LoginUserUseCase;

    constructor(@inject(TYPES.LOGIN_USER_USECASE) loginUserUseCase: LoginUserUseCase) {
        this.usecase = loginUserUseCase;
    }

    @httpPost('/login', validationMiddleware(userValidation.login))
    public async loginUser(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const results = await this.usecase.execute(req.body);

            req.session.user = {
                id: results.id!,
                email: results.email!,
                role: results.role!,
                token: results.token!,
            };
            delete results['role'];

            res.status(200);
            res.send(results);

        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }

}