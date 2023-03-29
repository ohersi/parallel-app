// Packages
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
// Imports
import UserRepository from "../../../repositories/user.repository"
import { TYPES } from "../../../utils/types";
import { User } from "src/entities/user.entity";
import { Loaded } from "@mikro-orm/core";


//** USE CASE */
// GIVEN: -
// WHEN: find all users in database
// THEN: return all users

@provide(TYPES.GET_ALL_USERS_USECASE)
export default class GetAllUsersUseCase {

    private userRepository: UserRepository;

    constructor(@inject(TYPES.USER_REPOSITORY) userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    public execute = async (): Promise<Loaded<User, never>[]> => {
        try {
            const allUsers = await this.userRepository.getAll();
            return allUsers;
        }
        catch (error) {
            throw new Error("Unexpected error with database, cannot get all users");
        }
    }
}