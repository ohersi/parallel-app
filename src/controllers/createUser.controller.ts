// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, httpPost, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify'
// Imports
import createUserUseCase from "../services/usercases/createUser.usecase";
import HttpException from '../utils/exceptions/http.exception';
import { TYPES } from '../utils/types';

@controller(`/api/v1/users`)
export default class createUserController {

    private readonly usecase: createUserUseCase;

    constructor(@inject(TYPES.CREATE_USER_USECASE) createUserUsecase: createUserUseCase) {
        this.usecase = createUserUsecase;
    }

    @httpPost('/')
    private async createUser(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const results = await this.usecase.execute(req.body);
            res.status(201).send("User created.");
        }
        catch (error) {
            next(new HttpException(400, 'User was not created'));
            res.status(400).send("User was not created");
        }
    }

}