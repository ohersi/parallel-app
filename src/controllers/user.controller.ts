// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, httpPost, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify'
// Imports
import IController from './interfaces/controller.interface';
import HttpException from '../utils/exceptions/http.exception';
import UserService from '../services/user.service';
import { TYPES } from '../utils/types';


@controller(`/api/v1/users`)
export default class UserController implements IController {

    //TODO: Research implementing express caching

    private readonly service: UserService;

    constructor(@inject(TYPES.USER_SERVICE) userService: UserService) {
        this.service = userService;
    }

    @httpGet('/')
    private async getAllUsers(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const results = await this.service.getAll();
            res.send(results);
        }
        catch (error) {
            next(new HttpException(400, 'Doesnt work!'));
        }
    }

};