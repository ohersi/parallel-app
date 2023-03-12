// Packages
import { inject } from 'inversify';
import { provide } from 'inversify-binding-decorators';
// Imports
import { Users } from '../models/user.entity';
import IService from './service.interface';
import UserRepository from '../repositories/user.repository';
import { TYPES } from '../types';


@provide(TYPES.USER_SERVICE)
export default class UserService implements IService {

    private userRepository: UserRepository;

    constructor(@inject(TYPES.USER_REPOSITORY) userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    //TODO: Find return type for each function instead of Promise<any>
    public getAllUsers = async (): Promise<any> => {
        try {
            const allUsers = this.userRepository.findAll();
            return allUsers;
        }
        catch (error) {
            return error;
        }
    }

    public getUserByID = async (id: number): Promise<any> => {
        try {
            const user = this.userRepository.findByID(id);
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
            ;
            const createUser = this.userRepository.create(body);
            await this.userRepository.persistAndFlush(createUser);
        }
        catch (error) {
            return error;
        }
    }
}