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

    // TODO: Create seperate routes file
    private initalizeRoutes(): void {
        this.router.get(`${this.path}`, this.getAllUsers);
        this.router.get(`${this.path}/:id`, this.getUserByID);
        this.router.post(`${this.path}/adduser`, this.createUser)
    }

    // arrow function allow for this.userService, otherwise is lost and be undefined
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

    private createUser = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const results = await this.usersService.newUser(req.body);
            res.status(201).send("User created.");
        }
        catch (error) {
            next(new HttpException(400, 'Doesnt work!'));
        }
    }


}