// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, request, response, next, httpGet } from 'inversify-express-utils'
// Imports
import ConfirmUserTokenUseCase from '../../services/usecases/user/confirmUserToken.usecase';
import { TYPES } from '../../utils/types';
import { inject } from 'inversify';

@controller(`/api/v1/registration`)
export default class ConfirmUserTokenController {

    private readonly usecase: ConfirmUserTokenUseCase;

    constructor(@inject(TYPES.CONFIRM_USER_TOKEN_USECASE) confirmUserTokenUsecase: ConfirmUserTokenUseCase) {
        this.usecase = confirmUserTokenUsecase;
    }

    @httpGet('/confirm')
    public async confirmToken(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const { token } = req.query;
            if (token) {
                await this.usecase.execute(token.toString());
                res.status(200);
                res.send("User has been registered.");
            }
            else {
                res.status(500);
                res.send({ error: { status: 500 }, message: "Missing token" });
            }
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }

}