//** TESTING */
//** GIVEN; the state of the world before the test aka Setup/Arramge */
//** WHEN I exercise the behavior under test aka Excerise/Act */
//** THEN we expect the following changes aka Verify/Assert */


// Packages
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
// Imports
import UserRepository from "../../../repositories/user.repository"
import UserDTO from "../../../dto/user.dto";
import { TYPES } from "../../../utils/types";
import { hash } from "../../../resources/security/encryption";
import UserException from "../../../utils/exceptions/user.expection";


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

    //TODO: Return JWT Token
    public execute = async (body: any): Promise<void | UserException> => {
        try {
            const foundUserEmail = await this.userRepository.findByEmail(body.email);
            if (foundUserEmail) {
                throw new UserException(`Email already exists: ${foundUserEmail.email}`)
            }
            // Hash password
            body.password = await hash(body.password);
            // Add to db, persists and flush
           const createdUser = await this.userRepository.save(body);
        }
        catch (err: any) {
            throw Error(err.message);
        }
    }
}