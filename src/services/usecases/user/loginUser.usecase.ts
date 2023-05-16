// Packages
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
// Imports
import UserDTO from "@/dto/user.dto";
import UserRepository from "@/repositories/user.repository"
import UserException from "@/utils/exceptions/user.expection";
import { createToken } from "@/resources/security/token";
import { decrypt } from "@/resources/security/encryption";
import { TYPES } from "@/utils/types";


//** USE CASE */
// GIVEN: an email and password
// WHEN: find a user matching the email and check password matches stored one
// THEN: return a user object

@provide(TYPES.LOGIN_USER_USECASE)
export default class LoginUserUseCase {

    private userRepository: UserRepository;

    constructor(@inject(TYPES.USER_REPOSITORY) userRepository: UserRepository) {
        this.userRepository = userRepository;
    }
    
    
    public execute = async (body: any): Promise<UserDTO> => {
        try {
            const foundUser = await this.userRepository.findByEmail(body.email);
            if (foundUser) {
                // Check if body passwords matches one foundUser
                const match = await decrypt(body.password, foundUser.password);
                if (match) {
                    // Create refresh jwt token
                    const refreshJWT = createToken(foundUser.email);     
                    return new UserDTO(
                        foundUser.id,
                        foundUser.slug,
                        foundUser.first_name,
                        foundUser.last_name,
                        foundUser.full_name,
                        foundUser.email,
                        undefined,
                        foundUser.avatar,
                        foundUser.role,
                        refreshJWT
                    );
                }
                throw Error('password or email does not match.');
            }
            throw Error('No email found.');
        }
        catch (err: any) {
            throw new UserException(err.message);
        }
    }
}