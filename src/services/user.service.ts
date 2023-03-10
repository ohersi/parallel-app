import { DI } from '../app'
import { Users } from '../models/user.entity';
import IService from './service.interface';

export default class UserService extends IService {

    constructor() {
        super();
    }

    //TODO: Find return type for each function instead of Promise<any>

    public getAllUsers = async (): Promise<any> => {
        try {
            const repo = DI.db.getRepository<Users>(Users);
            const allUsers = repo.findAll();
            return allUsers;
        }
        catch (error) {
            return error;
        }
    }

    public getUserByID = async (id: number): Promise<any> => {
        try {
            const repo = DI.db.getRepository<Users>(Users);
            const user = repo.findByID(id);
            return user;
        }
        catch (error) {
            return error;
        }
    }

    // TODO: Create userDTO 
    // TODO: Create UserExpection
    public newUser = async (body: any) => {
        try {
            const repo = DI.db.getRepository<Users>(Users);
            const createUser = repo.create(body);
            await repo.persistAndFlush(createUser);
        }
        catch (error) {
            return error;
        }
    }
}