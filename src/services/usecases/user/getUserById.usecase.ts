// Packages
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
// Imports
import UserRepository from "../../../repositories/user.repository"
import { TYPES } from "../../../utils/types";
import { User } from "src/entities/user.entity";
import { Loaded } from "@mikro-orm/core";


//** USE CASE */
// GIVEN: a user id
// WHEN: find a user matching the id
// THEN: return a user object

@provide(TYPES.GET_USER_BY_ID_USECASE)
export default class getUserByIdUseCase {

    private userRepository: UserRepository;

    constructor(@inject(TYPES.USER_REPOSITORY) userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    public execute = async (id: number): Promise<Loaded<User, never> | null> => {
        try {
            const user = await this.userRepository.findByID(id);
            if (user == null) {
                throw new Error("User not found");
            };
            return user;
        }
        catch (error) {
            throw  new Error("User not found");
        }
    }
}