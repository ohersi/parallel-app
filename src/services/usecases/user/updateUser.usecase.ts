//** TESTING */
//** GIVEN; the state of the world before the test aka Setup/Arramge */
//** WHEN I exercise the behavior under test aka Excerise/Act */
//** THEN we expect the following changes aka Verify/Assert */

// Packages
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
// Imports
import UserDTO from "@/dto/user.dto";
import UserRepository from "@/repositories/user.repository";
import UserException from "@/utils/exceptions/user.expection";
import { convertToSlug, concatNames } from "@/resources/helper/text-manipulation";
import { hash } from "@/resources/security/encryption";
import { TYPES } from "@/utils/types";

//** USE CASE */
// GIVEN: user object has has all fields
// WHEN: updating user info
// THEN: user info is updated

@provide(TYPES.UPDATE_USER_USECASE)
export default class UpdateUserUsecase {

    private userRepository: UserRepository;

    constructor(@inject(TYPES.USER_REPOSITORY) userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    public execute = async (user: UserDTO, id: number): Promise<UserDTO> => {
        try {
            // Find user
            const foundUser = await this.userRepository.findByID(id);
            if (!foundUser) {
                throw new UserException(`No user matching id ${id} found.`);
            }
            
            // Check if updated email already exists 
            if (user.email) {
                const emailExists = await this.userRepository.findByEmail(user.email);
                if (emailExists) {
                    throw new UserException('Email already exists');
                }
            }

            if (user.password) {
                user.password = await hash(user.password);
            }

            // Update slug and full name
            const fullname = concatNames(user.first_name, user.last_name, foundUser.first_name, foundUser.last_name);
            const slug = convertToSlug(fullname);
            user.full_name = fullname;
            user.slug = slug;

            // Update user
            const updatedUser = await this.userRepository.update(foundUser, user);
            // Return dto with updated user info
            return new UserDTO(
                updatedUser.id,
                updatedUser.slug,
                updatedUser.first_name,
                updatedUser.last_name,
                updatedUser.full_name,
                updatedUser.email,
                undefined,
                updatedUser.avatar,
                updatedUser.following_count,
                updatedUser.follower_count,
                updatedUser.role,
                updatedUser.enabled,
                updatedUser.locked,
            )
        }
        catch (err: any) {
            throw new UserException(err.message);
        }
    }
}