// Packages
import { inject } from 'inversify';
import { provide } from 'inversify-binding-decorators';
// Imports
import { User } from '../entities/user.entity';
import IService from './interfaces/service.interface';
import UserRepository from '../repositories/user.repository';
import { TYPES } from '../utils/types';
import UserDTO from '../dto/user.dto';


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
            if (user == null) {
                throw new Error("User not found");
            };
            return user;
        }
        catch (error) {
            throw new Error("Error with repo");
        }
    }

    // TODO: Create UserExpection
    //TODO: Return JWT Token instead of DTO
    public create = async (body: any): Promise<UserDTO | void> => {
        try {
            let userDTO = new UserDTO();
            const createUser = this.userRepository.save(body);
            await this.userRepository.persistAndFlush(createUser).then(async () => {
                userDTO.id = (await createUser).id;
                userDTO.firstname = (await createUser).firstname;
                userDTO.lastname = (await createUser).lastname;
                userDTO.email = (await createUser).email;
                userDTO.password = (await createUser).password;
                userDTO.profileimg = (await createUser).profileimg;
            }).then(() => { return userDTO }
            );
        }
        catch (error) {
            throw new Error("User was not created")
        }
    }
}