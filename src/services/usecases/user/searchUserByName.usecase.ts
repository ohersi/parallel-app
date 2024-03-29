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
// GIVEN: a user name
// WHEN: find all users matching portion/all of given name in db
// THEN: return all user

@provide(TYPES.SEARCH_USER_BY_NAME_USECASE)
export default class SearchUserByNameUsecase {

    private userRepository: UserRepository;

    constructor(@inject(TYPES.USER_REPOSITORY) userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    public execute = async (name: string): Promise<Loaded<User, never>[]> => {
        try {
            const user = await this.userRepository.searchUsersMatchingName(name);
            return user;
        }
        catch (err: any) {
            throw new UserException(err.message);
        }
    }
}