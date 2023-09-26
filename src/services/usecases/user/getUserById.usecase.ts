// Packages
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
// Imports
import UserDTO from "@/dto/user.dto";
import UserRepository from "@/repositories/user.repository"
import UserException from "@/utils/exceptions/user.expection";
import { TYPES } from "@/utils/types";

//** USE CASE */
// GIVEN: a user id
// WHEN: find a user matching the id
// THEN: return a user dto object

@provide(TYPES.GET_USER_BY_ID_USECASE)
export default class GetUserByIdUseCase {

    private userRepository: UserRepository;

    constructor(@inject(TYPES.USER_REPOSITORY) userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    public execute = async (id: number): Promise<UserDTO | null> => {
        try {
            const user = await this.userRepository.findByID(id);
            
            if (!user) return null;

            return new UserDTO(
                user.id,
                user.slug,
                user.first_name,
                user.last_name,
                user.full_name,
                user.email,
                undefined,
                user.avatar,
                user.following_count,
                user.follower_count,
                user.role,
                user.enabled,
                user.locked,
            );
        }
        catch (err: any) {
            throw new UserException(err.message);
        }
    }
}