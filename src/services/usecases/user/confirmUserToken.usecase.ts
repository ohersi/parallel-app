// Packages
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
import { JwtPayload } from "jsonwebtoken";
// Imports
import UserRepository from "@/repositories/user.repository"
import UserException from "@/utils/exceptions/user.expection";
import { verifyToken } from "@/resources/security/token";
import { TYPES } from "@/utils/types";

//** USE CASE */
// GIVEN: a json web token
// WHEN: verify token
// THEN: set user enabled to true

@provide(TYPES.CONFIRM_USER_TOKEN_USECASE)
export default class ConfirmUserTokenUseCase {

    private userRepository: UserRepository;

    constructor(@inject(TYPES.USER_REPOSITORY) userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    public execute = async (token: string): Promise<void> => {
        try {
            // Verify token
            const verifed = await verifyToken(token) as JwtPayload;
            // If token is verified get user
            const foundUser = await this.userRepository.findByEmail(verifed.email);
            // If user found set enabled to true
            if (!foundUser) {
                throw Error(`Email ${verifed.email} was not found.`);
            }
            // Update foundUser w/ enabled to true
            await this.userRepository.updateEnabled(foundUser);
        }
        catch (err: any) {
            throw new UserException(err.message);
        }
    }
}