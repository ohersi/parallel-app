// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, httpPost, request, response, next } from 'inversify-express-utils'
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
        
        // TODO: Fix nested if else 

        const { firstname, lastname, email, password, profileimg } = req.body;

        if (Object.keys(req.body).length === 0) {
            res.status(400);
            res.send({ message: "Input is empty" });

        }
        //TODO: Remove and replace test with Joi test
        else if (!firstname || !lastname || !email || !password || !profileimg) {
            res.status(400);
            res.send({ message: `Missing fields` });
        }

        const results: Boolean = await this.usecase.execute(req.body);
        // TODO: Find appropriate return to check
        if (results == true) {
            res.status(201);
            res.send({ message: "User was created" });
            return;
        }
        else {
            // next(new HttpException(400, 'User was not created'));
            //TODO: Return correct status code
            res.status(500);
            res.send({ message: "User not created" });
            return;
        }
    }

}