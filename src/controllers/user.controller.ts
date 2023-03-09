import { Request, Response, NextFunction, Router } from 'express';
import IController from './interfaces/controller.interface';
import HttpException from '../utils/exceptions/http.exception';
import UserService from '../services/user.service';


export default class UserController implements IController {

    public path = '/users';
    public router = Router();
    private usersService = new UserService();
    
    constructor() {
        this.initalizeRoutes();
    }

    private initalizeRoutes(): void {
        this.router.get(`${this.path}`, this.getAllUsers);
        this.router.get(`${this.path}/:id`, this.getUserByID);
    }

    private getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const results = await this.usersService.getAllUsers();
            res.send(results);
        }
        catch (error) {
            next(new HttpException(400, 'Doesnt work!'));
        }
    }

    private getUserByID = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const id = parseInt(req.params.id);
            const results = await this.usersService.getUserByID(id);
            res.send(results);
        }
        catch (error) {
            next(new HttpException(400, 'Doesnt work!'));
        }
    }


}