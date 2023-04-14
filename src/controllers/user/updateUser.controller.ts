// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpPut, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify'
// Imports
import UpdateUserUsecase from '../../services/usecases/user/updateUser.usecase';
import validationMiddleware from '../../middleware/validation.middleware';
import userValidation from '../../resources/validations/user.validation';
import { sessionAuth } from '../../middleware/auth.middleware';
import { TYPES } from '../../utils/types';
import UserDTO from '../../dto/user.dto';

@controller(`/api/v1/users`)
export default class UpdateUserController {

    private readonly usecase: UpdateUserUsecase;

    constructor(@inject(TYPES.UPDATE_USER_USECASE) updateUserUsecase: UpdateUserUsecase) {
        this.usecase = updateUserUsecase;
    }

    @httpPut('/update', validationMiddleware(userValidation.update), sessionAuth)
    public async createUser(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const user = req.body as UserDTO;
            const results = await this.usecase.execute(user);
            res.status(200);
            res.send({ message: "User has been updated.", updated: results });
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }

}