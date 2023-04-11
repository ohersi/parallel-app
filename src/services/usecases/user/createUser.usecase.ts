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
import { TYPES } from "../../../utils/types";
import { TYPES_ENUM } from "../../../utils/types/enum";
import { hash } from "../../../resources/security/encryption";
import { User } from "../../../entities/user.entity";
import { createToken } from "../../../resources/security/token";

//** USE CASE */
// GIVEN: user object has has all fields
// WHEN: creating a new user
// THEN: user is created

@provide(TYPES.CREATE_USER_USECASE)
export default class CreateUserUseCase {

    private userRepository: UserRepository;

    constructor(@inject(TYPES.USER_REPOSITORY) userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    public execute = async (body: any): Promise<string | UserException> => {
        try {
            const foundUserEmail = await this.userRepository.findByEmail(body.email);
            if (foundUserEmail) {
                throw new UserException(`Email already exists: ${foundUserEmail.email}`)
            }
            // Hash password
            body.password = await hash(body.password);
            // Create user entity
            const newUser = new User(
                body.first_name,
                body.last_name,
                body.email,
                body.password,
                body.avatar_url,
                TYPES_ENUM.USER
            );
            // Add to db, persists and flush
            const createdUser = await this.userRepository.save(newUser);
            // Create jwt token
            //TODO: Send user token to email server
            const token = createToken(createdUser.email);
            return token;
        }
        catch (err: any) {
            throw Error(err.message);
        }
    }
}