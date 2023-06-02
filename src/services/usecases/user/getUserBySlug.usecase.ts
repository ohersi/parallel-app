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

@provide(TYPES.GET_USER_BY_SLUG_USECASE)
export default class GetUserBySlugUseCase {

    private userRepository: UserRepository;

    constructor(@inject(TYPES.USER_REPOSITORY) userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    public execute = async (slug: string): Promise<Loaded<User, never> | null> => {
        try {
            const user = await this.userRepository.findBySlug(slug);
            if (!user) {
                throw new UserException(`No user with name [${slug}] found.`)
            };
            return user;
        }
        catch (err: any) {
            throw new UserException(err.message);
        }
    }
}