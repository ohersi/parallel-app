// Packages
import { inject } from 'inversify';
import { provide } from 'inversify-binding-decorators';
// Imports
import { User } from '../entities/user.entity';
import IService from './interfaces/service.interface';
import UserRepository from '../repositories/user.repository';
import { TYPES } from '../utils/types';


@provide(TYPES.USER_SERVICE)
export default class UserService implements IService {

    private userRepository: UserRepository;

    constructor(@inject(TYPES.USER_REPOSITORY) userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    //TODO: Find return type for each function instead of Promise<any>
    public getAll = async (): Promise<any> => {
        try {
            const allUsers = await this.userRepository.getAll();
            return allUsers;
        }
        catch (error) {
            throw new Error("Unexpected error");
        }
    }

    public findByID = async (id: number): Promise<any> => {
        try {
            const user = await this.userRepository.findByID(id);
            return user;
        }
        catch (error) {
            throw new Error("User not found?");
        }
    }

    // TODO: Create userDTO 
    // TODO: Create UserExpection
    public create = async (body: any) => {
        try {
            ;
            const createUser = this.userRepository.save(body);
            await this.userRepository.persistAndFlush(createUser);
        }
        catch (error) {
            return error;
        }
    }
}