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

    public execute = async (user: UserDTO): Promise<any> => {
        try {
            // Find user
            const foundUser = await this.userRepository.findByEmail(user.email!);
            if (!foundUser) {
                throw new UserException('No email found.');
            }
            // TODO: Ensure safe password changes
            if (user.password) {
                user.password = await hash(user.password);
            }
            // Update user
            const updatedUser = await this.userRepository.update(foundUser, user);
            // Return dto with updated user info
            return new UserDTO(
                updatedUser.id,
                updatedUser.first_name,
                updatedUser.last_name,
                updatedUser.email,
                updatedUser.password,
                updatedUser.avatar_url,
                updatedUser.role,
                updatedUser.token,
            )
        }
        catch (err: any) {
            throw Error(err.message);
        }
    }
}