// Packages
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
// Imports
import UserRepository from "../../../repositories/user.repository"
import { TYPES } from "../../../utils/types";
import { User } from "src/entities/user.entity";
import { Loaded } from "@mikro-orm/core";
import UserException from "../../../utils/exceptions/user.expection";
import PageResults from "../../../resources/pagination/pageResults";

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

    public execute = async (last_id: number, limit: number): Promise<PageResults> => {
        try {
            const [allUsers, total] = await this.userRepository.findAllByLastID(last_id, limit);
            // when next reaches last item should it be null or total ???
            let next = last_id + 1 > total ? null : last_id + 1;

            const pageResults = new PageResults(
                total,
                next,
                allUsers,
            );
            return pageResults;
        }
        catch (err: any) {
            throw new UserException(err.message);
        }
    }
}