// Packages
import { Request, Response, NextFunction, Router } from 'express';
import { controller, httpGet, httpPost, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify'
// Imports
import IController from './interfaces/controller.interface';
import HttpException from '../utils/exceptions/http.exception';
import UserService from '../services/user.service';
import { TYPES } from '../types';


@controller(`/api/v1/users`)
export default class UserController implements IController {

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
            const results = await this.service.getAllUsers();
            res.send(results);
        }
        catch (error) {
            next(new HttpException(400, 'Doesnt work!'));
        }
    }

    @httpGet('/:id')
    private async getUserByID(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const id = parseInt(req.params.id);
            const results = await this.service.getUserByID(id);
            res.send(results);
        }
        catch (error) {
            next(new HttpException(400, 'Doesnt work!'));
        }
    }

    @httpPost('/create')
    private async createUser(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const results = await this.service.newUser(req.body);
            res.status(201).send("User created.");
        }
        catch (error) {
            next(new HttpException(400, 'Doesnt work!'));
        }
    }


}