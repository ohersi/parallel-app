// Packages
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
// Imports
import UserRepository from "../../../repositories/user.repository"
import { TYPES } from "../../../utils/types";
import { User } from "../../../entities/user.entity";
import { Loaded } from "@mikro-orm/core";
import UserException from "../../../utils/exceptions/user.expection";
import { decrypt } from "../../../resources/security/encryption";
import UserDTO from "../../../dto/user.dto";
import { boolean } from "joi";


//** USE CASE */
// GIVEN: an email and password
// WHEN: find a user matching the email and check password matches stored one
// THEN: return a user object

@provide(TYPES.LOGIN_USER)
export default class LoginUserUseCase {

    private userRepository: UserRepository;

    constructor(@inject(TYPES.USER_REPOSITORY) userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    public execute = async (body: any): Promise<UserDTO | boolean | UserException> => {
        try {
            const foundUser = await this.userRepository.findByEmail(body.email);
            if (foundUser) {
                // Check if body passwords matches one foundUser
                const match = await decrypt(body.password, foundUser.password);
                if (match) {
                    //TODO: return userDTO w/ jwt token
                    return new UserDTO(foundUser.id, foundUser.firstname, foundUser.lastname, foundUser.email);
                }
            }
            return false;
        }
        catch (err: any) {
            throw new UserException(err.message);
        }
    }
}