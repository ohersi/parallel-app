// Packages
import { inject } from 'inversify';
import { provide } from 'inversify-binding-decorators';
// Imports
import { User } from '../entities/user.entity';
import IService from './interfaces/service.interface';
import UserRepository from '../repositories/user.repository';
import { TYPES } from '../utils/types';
import UserDTO from '../dto/user.dto';
import { Loaded } from '@mikro-orm/core';


@provide(TYPES.USER_SERVICE)
export default class UserService implements IService {

    private userRepository: UserRepository;

    constructor(@inject(TYPES.USER_REPOSITORY) userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    //TODO: Find return type for each function instead of Promise<any>
    public getAll = async (): Promise<Loaded<User, never>[]> => {
        try {
            const allUsers = await this.userRepository.getAll();
            return allUsers;
        }
        catch (error) {
            throw new Error("Unexpected error");
        }
    }

    public findByID = async (id: number): Promise<Loaded<User, never> | null> => {
        try {
            const user = await this.userRepository.findByID(id);
            if (user == null) {
                throw Error("User not found");
            };
            return user;
        }
        catch (error) {
            throw Error("User not found");
        }
    }

}