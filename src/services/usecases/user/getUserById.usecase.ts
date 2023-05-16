// Packages
import { Loaded } from "@mikro-orm/core";
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
// Imports
import { User } from "src/entities/user.entity";
import UserRepository from "@/repositories/user.repository"
import UserException from "@/utils/exceptions/user.expection";
import { TYPES } from "@/utils/types";

//** USE CASE */
// GIVEN: a user id
// WHEN: find a user matching the id
// THEN: return a user object

@provide(TYPES.GET_USER_BY_ID_USECASE)
export default class GetUserByIdUseCase {

    private userRepository: UserRepository;

    constructor(@inject(TYPES.USER_REPOSITORY) userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    public execute = async (id: number): Promise<Loaded<User, never> | null> => {
        try {
            const user = await this.userRepository.findByID(id);
            if (!user) {
                throw new UserException(`No user with id [${id}] found.`)
            };
            return user;
        }
        catch (err: any) {
            throw new UserException(err.message);
        }
    }
}