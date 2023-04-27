//** TESTING */
//** GIVEN; the state of the world before the test aka Setup/Arramge */
//** WHEN I exercise the behavior under test aka Excerise/Act */
//** THEN we expect the following changes aka Verify/Assert */


// Packages
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
// Imports
import UserRepository from "../../../repositories/user.repository";
import UserException from "../../../utils/exceptions/user.expection";
import UserDTO from "../../../dto/user.dto";
import { hash } from "../../../resources/security/encryption";
import { TYPES } from "../../../utils/types";
import { convertToSlug, concatNames } from "../../../resources/helper/text-manipulation";

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

    public execute = async (user: UserDTO): Promise<UserDTO> => {
        try {
            // Find user
            const foundUser = await this.userRepository.findByEmail(user.email!);
            if (!foundUser) {
                throw new UserException('No email found.');
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
                updatedUser.role,
            )
        }
        catch (err: any) {
            throw new UserException(err.message);
        }
    }
}