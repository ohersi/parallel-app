import { Request, Response, NextFunction, Router} from 'express';
import IController from './interfaces/controller.interface';
import HttpException from '../utils/exceptions/http.exception';
import { Users } from '../models/user.entity';
import { DI } from '../app';


export default class UserController implements IController {
    
    public path = '/testing';
    public router = Router();

    constructor() {
        this.initalizeRoutes();
    }

    private initalizeRoutes(): void {
        this.router.get(`${this.path}`, this.look);
    }

    private async look(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const repo = DI.database.getRepository(Users);
            const findUser = repo.findByID(3);
            const user = await findUser;
            res.send(user);
        } 
        catch (error) {
            next(new HttpException(400, 'Doesnt work!'));
        }
    }
}