// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpPost, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify'
// Imports
import createUserUseCase from "../services/usercases/createUser.usecase";
import HttpException from '../utils/exceptions/http.exception';
import validationMiddleware from '../middleware/validation.middleware';
import userValidation from '../resources/validations/user.validation';
import { TYPES } from '../utils/types';

@controller(`/api/v1/users`)
export default class createUserController {

    private readonly usecase: createUserUseCase;

    constructor(@inject(TYPES.CREATE_USER_USECASE) createUserUsecase: createUserUseCase) {
        this.usecase = createUserUsecase;
    }

    @httpPost('/', validationMiddleware(userValidation.create))
    public async createUser(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            // TODO: Find appropriate return to check
            const results = await this.usecase.execute(req.body);
            res.status(201);
            res.send({ message: "User was created" });
        }
        catch (error: any) {
            //TODO: Return correct status code
            //TODO: Add back next(new HttpException(500, { message: error.message }))
            res.status(500);
            res.send({ message: error.message });
        }
    }

}